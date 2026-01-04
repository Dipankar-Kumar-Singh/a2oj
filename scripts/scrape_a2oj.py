#!/usr/bin/env python3
"""
A2OJ Ladder Data Scraper

Scrapes ladder and problem data from:
https://earthshakira.github.io/a2oj-clientside/server/

Output structure:
  src/data/ladders/
    index.json          - Index of all ladders
    ladder-{id}.json    - Individual ladder with problems
"""

import json
import os
import re
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

# Configuration
BASE_URL = "https://earthshakira.github.io/a2oj-clientside/server/"
LADDERS_URL = urljoin(BASE_URL, "Ladders.html")
OUTPUT_DIR = Path(__file__).parent.parent / "src" / "data" / "ladders"
REQUEST_DELAY = 0.5  # Seconds between requests to be polite


def fetch_page(url: str) -> BeautifulSoup:
    """Fetch a page and return BeautifulSoup object."""
    print(f"  Fetching: {url}")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    time.sleep(REQUEST_DELAY)
    return BeautifulSoup(response.text, "html.parser")


def parse_ladders_index(soup: BeautifulSoup) -> Dict[str, List[Dict]]:
    """Parse the main ladders page to get ladder index."""
    ladders = {
        "rating": [],
        "division": [],
        "extra": []
    }
    
    tables = soup.find_all("table")
    
    for table in tables:
        rows = table.find_all("tr")
        for row in rows:
            cells = row.find_all("td")
            if len(cells) < 3:
                continue
            
            try:
                ladder_id = int(cells[0].get_text(strip=True))
                link = cells[1].find("a")
                if not link:
                    continue
                
                name = link.get_text(strip=True)
                problem_count = int(cells[2].get_text(strip=True))
                href = link.get("href", "")
                
                ladder_info = {
                    "id": ladder_id,
                    "name": name,
                    "problemCount": problem_count,
                    "href": href
                }
                
                # Categorize the ladder
                if "Extra" in name:
                    ladder_info["type"] = "extra"
                    ladders["extra"].append(ladder_info)
                elif "Div." in name:
                    ladder_info["type"] = "division"
                    ladders["division"].append(ladder_info)
                else:
                    ladder_info["type"] = "rating"
                    ladders["rating"].append(ladder_info)
                    
            except (ValueError, AttributeError) as e:
                print(f"    Skipping row: {e}")
                continue
    
    return ladders


def parse_problem_link(href: str) -> Optional[Tuple[int, str]]:
    """Parse Codeforces problem link to extract contestId and problemId."""
    # Pattern: https://codeforces.com/problemset/problem/123/A
    # or: https://codeforces.com/contest/123/problem/A
    patterns = [
        r"codeforces\.com/problemset/problem/(\d+)/([A-Za-z]\d?)",
        r"codeforces\.com/contest/(\d+)/problem/([A-Za-z]\d?)",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, href)
        if match:
            return int(match.group(1)), match.group(2).upper()
    
    return None


def parse_ladder_page(soup: BeautifulSoup, ladder_id: int, ladder_name: str, ladder_type: str) -> dict:
    """Parse an individual ladder page to get problems."""
    problems = []
    description = ""
    difficulty_level = 1
    
    tables = soup.find_all("table")
    
    # First table contains metadata
    if len(tables) >= 1:
        meta_table = tables[0]
        rows = meta_table.find_all("tr")
        for row in rows:
            text = row.get_text()
            if "Description:" in text:
                # Extract description after "Description:"
                desc_td = row.find("td")
                if desc_td:
                    desc_text = desc_td.get_text(strip=True)
                    if "Description:" in desc_text:
                        description = desc_text.split("Description:")[-1].strip()
            elif "Difficulty Level:" in text:
                # Extract difficulty level
                level_match = re.search(r"Difficulty Level:\s*(\d+)", text)
                if level_match:
                    difficulty_level = int(level_match.group(1))
    
    # Second table contains problems
    if len(tables) >= 2:
        problems_table = tables[1]
        rows = problems_table.find_all("tr")
        
        for row in rows:
            # Skip header rows (th elements)
            if row.find("th"):
                continue
            
            cells = row.find_all("td")
            if len(cells) < 2:
                continue
            
            try:
                # Get position (first column)
                position_text = cells[0].get_text(strip=True)
                if not position_text.isdigit():
                    continue
                position = int(position_text)
                
                # Get problem link and name (second column)
                link = cells[1].find("a")
                if not link:
                    continue
                
                problem_name = link.get_text(strip=True)
                problem_href = link.get("href", "")
                
                # Parse contest ID and problem ID from link
                parsed = parse_problem_link(problem_href)
                if not parsed:
                    print(f"    Warning: Could not parse problem link: {problem_href}")
                    continue
                
                contest_id, problem_id = parsed
                
                problem = {
                    "position": position,
                    "name": problem_name,
                    "contestId": contest_id,
                    "problemId": problem_id,
                }
                
                # Get difficulty from 4th column if available
                if len(cells) >= 4:
                    diff_text = cells[3].get_text(strip=True)
                    if diff_text.isdigit():
                        problem["difficulty"] = int(diff_text)
                
                problems.append(problem)
                
            except (ValueError, AttributeError) as e:
                print(f"    Skipping problem row: {e}")
                continue
    
    return {
        "id": ladder_id,
        "name": ladder_name,
        "type": ladder_type,
        "description": description,
        "difficultyLevel": difficulty_level,
        "problemCount": len(problems),
        "problems": problems
    }


def save_json(data: Any, filepath: Path) -> None:
    """Save data as JSON file."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  Saved: {filepath}")


def main():
    print("=" * 60)
    print("A2OJ Ladder Data Scraper")
    print("=" * 60)
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Step 1: Fetch and parse main ladders page
    print("\n[1/3] Fetching ladders index...")
    main_soup = fetch_page(LADDERS_URL)
    ladders_index = parse_ladders_index(main_soup)
    
    total_ladders = sum(len(v) for v in ladders_index.values())
    print(f"  Found {total_ladders} ladders:")
    print(f"    - Rating: {len(ladders_index['rating'])}")
    print(f"    - Division: {len(ladders_index['division'])}")
    print(f"    - Extra: {len(ladders_index['extra'])}")
    
    # Step 2: Fetch each ladder's problems
    print("\n[2/3] Fetching individual ladders...")
    all_ladders = []
    
    for category in ["rating", "division", "extra"]:
        for ladder in ladders_index[category]:
            ladder_id = ladder["id"]
            ladder_name = ladder["name"]
            ladder_type = ladder["type"]
            href = ladder.get("href", f"Ladder{ladder_id}.html")
            
            print(f"\n  Ladder {ladder_id}: {ladder_name}")
            
            ladder_url = urljoin(BASE_URL, href)
            ladder_soup = fetch_page(ladder_url)
            
            ladder_data = parse_ladder_page(ladder_soup, ladder_id, ladder_name, ladder_type)
            all_ladders.append(ladder_data)
            
            print(f"    Found {ladder_data['problemCount']} problems")
            
            # Save individual ladder file
            ladder_file = OUTPUT_DIR / f"ladder-{ladder_id}.json"
            save_json(ladder_data, ladder_file)
    
    # Step 3: Save index file (without href, with clean data)
    print("\n[3/3] Saving index file...")
    
    index_data = {
        "rating": [],
        "division": [],
        "extra": []
    }
    
    for ladder in all_ladders:
        category = ladder["type"]
        index_data[category].append({
            "id": ladder["id"],
            "name": ladder["name"],
            "problemCount": ladder["problemCount"]
        })
    
    # Sort by ID
    for category in index_data:
        index_data[category].sort(key=lambda x: x["id"])
    
    save_json(index_data, OUTPUT_DIR / "index.json")
    
    # Summary
    print("\n" + "=" * 60)
    print("Scraping complete!")
    print("=" * 60)
    
    total_problems = sum(l["problemCount"] for l in all_ladders)
    print(f"\nSummary:")
    print(f"  - Ladders scraped: {len(all_ladders)}")
    print(f"  - Total problems: {total_problems}")
    print(f"  - Output directory: {OUTPUT_DIR}")
    print(f"\nFiles created:")
    print(f"  - {OUTPUT_DIR / 'index.json'}")
    for ladder in sorted(all_ladders, key=lambda x: x["id"]):
        ladder_id = ladder["id"]
        print(f"  - {OUTPUT_DIR / f'ladder-{ladder_id}.json'}")


if __name__ == "__main__":
    main()


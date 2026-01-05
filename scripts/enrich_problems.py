#!/usr/bin/env python3
"""
Codeforces Problem Data Enricher

Fetches problem data (rating, tags) from Codeforces API and enriches
the existing ladder JSON files.

API Endpoint: https://codeforces.com/api/problemset.problems
"""

import json
import time
from pathlib import Path
from typing import Dict, Optional

import requests

# Configuration
CODEFORCES_API = "https://codeforces.com/api/problemset.problems"
LADDERS_DIR = Path(__file__).parent.parent / "src" / "data" / "ladders"
REQUEST_TIMEOUT = 30


def fetch_all_problems() -> Dict[str, dict]:
    """
    Fetch all problems from Codeforces API.
    Returns a dict mapping "contestId-problemIndex" to problem data.
    """
    print("Fetching all problems from Codeforces API...")
    print(f"  URL: {CODEFORCES_API}")
    
    response = requests.get(CODEFORCES_API, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    
    data = response.json()
    
    if data.get("status") != "OK":
        raise Exception(f"API returned error: {data.get('comment', 'Unknown error')}")
    
    problems = data["result"]["problems"]
    print(f"  Fetched {len(problems)} problems from Codeforces")
    
    # Create lookup dict: "contestId-problemIndex" -> problem
    problem_map = {}
    for problem in problems:
        contest_id = problem.get("contestId")
        index = problem.get("index")
        if contest_id and index:
            key = f"{contest_id}-{index}"
            problem_map[key] = {
                "rating": problem.get("rating"),  # Can be None if not rated
                "tags": problem.get("tags", []),
                "name": problem.get("name"),
                "type": problem.get("type"),
            }
    
    print(f"  Created lookup map with {len(problem_map)} entries")
    return problem_map


def enrich_ladder(ladder_path: Path, problem_map: Dict[str, dict]) -> dict:
    """
    Enrich a single ladder file with Codeforces data.
    Returns stats about the enrichment.
    """
    with open(ladder_path, "r", encoding="utf-8") as f:
        ladder = json.load(f)
    
    ladder_id = ladder.get("id", "?")
    ladder_name = ladder.get("name", "Unknown")
    
    enriched_count = 0
    missing_count = 0
    
    for problem in ladder.get("problems", []):
        contest_id = problem.get("contestId")
        problem_id = problem.get("problemId")
        
        if not contest_id or not problem_id:
            missing_count += 1
            continue
        
        key = f"{contest_id}-{problem_id}"
        cf_data = problem_map.get(key)
        
        if cf_data:
            # Add rating if available
            if cf_data.get("rating") is not None:
                problem["rating"] = cf_data["rating"]
            
            # Add tags
            if cf_data.get("tags"):
                problem["tags"] = cf_data["tags"]
            
            enriched_count += 1
        else:
            missing_count += 1
    
    # Save enriched ladder
    with open(ladder_path, "w", encoding="utf-8") as f:
        json.dump(ladder, f, indent=2, ensure_ascii=False)
    
    return {
        "id": ladder_id,
        "name": ladder_name,
        "total": len(ladder.get("problems", [])),
        "enriched": enriched_count,
        "missing": missing_count,
    }


def main():
    print("=" * 60)
    print("Codeforces Problem Data Enricher")
    print("=" * 60)
    
    # Step 1: Fetch all problems from Codeforces
    print("\n[1/2] Fetching Codeforces problem data...")
    try:
        problem_map = fetch_all_problems()
    except Exception as e:
        print(f"\n❌ Error fetching Codeforces data: {e}")
        return 1
    
    # Step 2: Enrich each ladder file
    print("\n[2/2] Enriching ladder files...")
    
    ladder_files = sorted(LADDERS_DIR.glob("ladder-*.json"))
    print(f"  Found {len(ladder_files)} ladder files\n")
    
    stats = []
    for ladder_path in ladder_files:
        result = enrich_ladder(ladder_path, problem_map)
        stats.append(result)
        
        status = "✓" if result["missing"] == 0 else "⚠"
        print(f"  {status} Ladder {result['id']:2d}: {result['enriched']:3d}/{result['total']:3d} enriched"
              f" ({result['name'][:40]})")
    
    # Summary
    print("\n" + "=" * 60)
    print("Enrichment complete!")
    print("=" * 60)
    
    total_problems = sum(s["total"] for s in stats)
    total_enriched = sum(s["enriched"] for s in stats)
    total_missing = sum(s["missing"] for s in stats)
    
    print(f"\nSummary:")
    print(f"  - Ladders processed: {len(stats)}")
    print(f"  - Total problems: {total_problems}")
    print(f"  - Enriched with CF data: {total_enriched}")
    print(f"  - Missing from CF API: {total_missing}")
    print(f"\nEach problem now has:")
    print(f"  - rating: Codeforces difficulty rating (e.g., 800, 1200, 1600)")
    print(f"  - tags: Array of topic tags (e.g., ['math', 'dp', 'greedy'])")
    
    return 0


if __name__ == "__main__":
    exit(main())


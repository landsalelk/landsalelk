import json
import re
import os
import glob

# Configuration
# Resolve paths relative to this script file
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # site/manager_ai
PROJECT_ROOT = os.path.dirname(BASE_DIR)              # site
APPWRITE_JSON_PATH = os.path.join(PROJECT_ROOT, "appwrite.json")
SRC_DIR = os.path.join(PROJECT_ROOT, "src")

def load_valid_attributes():
    """Parse appwrite.json to find all defined attribute keys."""
    valid_attrs = set()
    try:
        with open(APPWRITE_JSON_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        collections = data.get('collections', [])
        for col in collections:
            # Add system attributes
            valid_attrs.add('$id')
            valid_attrs.add('$createdAt')
            valid_attrs.add('$updatedAt')
            
            attributes = col.get('attributes', [])
            for attr in attributes:
                if 'key' in attr:
                    valid_attrs.add(attr['key'])
                
            # Check indexes (sometimes used in queries)
            indexes = col.get('indexes', [])
            for idx in indexes:
                if 'key' in idx:
                    valid_attrs.add(idx['key'])
                    
        return valid_attrs
    except Exception as e:
        print(f"Error reading appwrite.json: {e}")
        return set()

def scan_query_usage(valid_attrs):
    """Scan source code for Query.* usage and validate attributes."""
    # Regex to match Query.method("attribute", ...) or Query.method('attribute', ...)
    # Supports: equal, notEqual, lessThan, lessThanEqual, greaterThan, greaterThanEqual, search, orderDesc, orderAsc, isNull, isNotNull, between
    query_pattern = re.compile(r'Query\.\w+\s*\(\s*[\'"]([a-zA-Z0-9_]+)[\'"]')
    
    errors = []
    
    # Walk through src directory
    for root, dirs, files in os.walk(SRC_DIR):
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        
                    for line_num, line in enumerate(lines, 1):
                        matches = query_pattern.findall(line)
                        for attr in matches:
                            if attr not in valid_attrs:
                                # Heuristic: Ignore some common non-attribute strings if matched by accident, 
                                # but usually Query.equal('string') implies 'string' is an attribute.
                                errors.append(f"❌ {os.path.basename(path)}:{line_num} -> Query uses unknown attribute '{attr}'")
                except Exception as e:
                    pass
                    
    return errors

if __name__ == "__main__":
    print("🔍 Starting Static Schema Analysis...")
    attrs = load_valid_attributes()
    print(f"ℹ️  Loaded {len(attrs)} valid attributes from appwrite.json.")
    
    issues = scan_query_usage(attrs)
    
    if issues:
        print(f"\n🚨 Found {len(issues)} Potential Invalid Queries:")
        for issue in issues:
            print(issue)
        # Exit with error to fail the build/check
        exit(1)
    else:
        print("\n✅ No invalid query attributes found.")
        exit(0)

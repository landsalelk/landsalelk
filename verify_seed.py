import json
import sys

def verify_content_seed(file_path):
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        slugs = {item['slug'] for item in data}
        errors = []
        
        print(f"Loaded {len(data)} articles.")
        
        for index, article in enumerate(data):
            # Check 1: Required fields
            required_fields = ['title', 'slug', 'target_keyword', 'cluster', 'internal_links', 'cta']
            for field in required_fields:
                if field not in article:
                    errors.append(f"Article '{article.get('title', 'Unknown')}' missing field '{field}'")
            
            # Check 2: Spiderweb Linking (Internal links must exist)
            links = article.get('internal_links', [])
            if len(links) < 3:
                errors.append(f"Article '{article['title']}' has fewer than 3 internal links ({len(links)})")
            
            for link in links:
                if link not in slugs:
                    errors.append(f"Article '{article['title']}' has BROKEN internal link: '{link}'")

        if errors:
            print("\n❌ Verification Failed with errors:")
            for error in errors:
                print(f" - {error}")
            sys.exit(1)
        else:
            print("\n✅ Verification Successful! All linking logic is valid.")
            return True

    except Exception as e:
        print(f"❌ Critical Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    verify_content_seed('./content_seed.json')

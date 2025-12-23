import os
import subprocess
import json

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # site/manager_ai
PROJECT_ROOT = os.path.dirname(BASE_DIR)              # site
FUNCTIONS_DIR = os.path.join(PROJECT_ROOT, "functions")

import sys

def check_functions(auto_fix=False):
    if not os.path.exists(FUNCTIONS_DIR):
        print(f"❌ Functions directory not found: {FUNCTIONS_DIR}")
        return 1

    errors = []
    fixed_count = 0
    
    # Iterate over all subdirectories
    for func_name in os.listdir(FUNCTIONS_DIR):
        func_path = os.path.join(FUNCTIONS_DIR, func_name)
        if not os.path.isdir(func_path):
            continue
            
        print(f"🔎 Checking {func_name}...")
        
        # 1. Check Package.json
        pkg_path = os.path.join(func_path, "package.json")
        if not os.path.exists(pkg_path):
            print(f"   ⚠️  No package.json found. Skipping.")
            continue
            
        try:
            with open(pkg_path, 'r') as f:
                pkg_data = json.load(f)
                
            # Check for Module type if using ESM
            is_esm = pkg_data.get("type") == "module"
            
            # 2. Check Main Entry
            main_file = pkg_data.get("main", "src/main.js")
            main_path = os.path.join(func_path, main_file)
            
            if os.path.exists(main_path):
                # Check for Import statements
                has_import = False
                try:
                    with open(main_path, 'r', encoding='utf-8') as mf:
                        content = mf.read()
                        if "import " in content or "export " in content:
                            has_import = True
                except:
                    pass

                if has_import and not is_esm:
                    msg = f"❌ {func_name}: Uses ESM (import/export) but 'type': 'module' is missing"
                    if auto_fix:
                        print(f"   🩹 Auto-Fixing {func_name} (Adding 'type': 'module')...")
                        # Inject type: module
                        # Preserve order roughly by loading as dict and re-inserting
                        # Just add it after "name" or at top
                        pkg_data["type"] = "module"
                        with open(pkg_path, 'w') as f:
                            json.dump(pkg_data, f, indent=2)
                        fixed_count += 1
                        print(f"   ✅ Fixed.")
                    else:
                        errors.append(msg)

                # 2. Syntax Check (Node)
                cmd = f"node --check {main_file}"
                result = subprocess.run(
                    cmd, 
                    cwd=func_path, 
                    shell=True, 
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.PIPE
                )
                
                if result.returncode != 0:
                    errors.append(f"❌ {func_name}: Syntax Validation Failed.\n   {result.stderr.decode('utf-8').strip()}")
                else:
                    print(f"   ✅ Syntax OK")

            else:
                errors.append(f"❌ {func_name}: Main entry point '{main_file}' not found.")

        except json.JSONDecodeError:
             errors.append(f"❌ {func_name}: Invalid package.json")
        except Exception as e:
             errors.append(f"❌ {func_name}: Unknown Error - {str(e)}")

    if errors:
        print("\n🚨 Function Health Check Failed:")
        for e in errors:
            print(e)
        return 1
    
    if auto_fix and fixed_count > 0:
        print(f"\n✨ Auto-Fixed {fixed_count} issues.")
        
    print("\n✅ All Functions Healthy.")
    return 0

if __name__ == "__main__":
    auto_fix = "--fix" in sys.argv
    exit(check_functions(auto_fix))

import os
import re

def get_all_files(directory):
    files = []
    for root, _, filenames in os.walk(directory):
        for filename in filenames:
            if filename.endswith(('.ts', '.tsx')):
                files.append(os.path.join(root, filename))
    return files

def find_dead_files(src_dir, workspace_root):
    all_files = get_all_files(src_dir)
    # Targets for dead code check
    targets = [f for f in all_files if any(x in f for x in ['src/components/', 'src/hooks/', 'src/lib/'])]
    
    dead_files = []
    
    for target in targets:
        # Ignore index files for now as they are often just re-exporters
        # Actually, let's keep them but handle carefully.
        
        rel_path = os.path.relpath(target, src_dir)
        basename = os.path.basename(target).split('.')[0]
        
        # Search for imports of this file
        found = False
        for f in all_files:
            if f == target:
                continue
            
            with open(f, 'r', errors='ignore') as file_content:
                content = file_content.read()
                
                # Check for relative imports and alias imports
                # e.g. import { ... } from '@/components/...'
                # e.g. import { ... } from './...'
                
                # If it's an index file, search for the directory name import
                if basename == 'index':
                    parent_dir = os.path.basename(os.path.dirname(target))
                    # import from '../dir' or '@/components/dir'
                    patterns = [
                        rf"from ['\"].*?/{parent_dir}['\"]",
                        rf"from ['\"].*?/{parent_dir}/index['\"]"
                    ]
                else:
                    patterns = [
                        rf"from ['\"].*?/{basename}['\"]"
                    ]
                
                for pattern in patterns:
                    if re.search(pattern, content):
                        found = True
                        break
            if found:
                break
        
        if not found:
            # Final check: is it used in a page.tsx or layout.tsx?
            # (The loop above already checks all files including pages/layouts)
            dead_files.append(target)
            
    return dead_files

def check_architectural_bleeds(src_dir):
    modules_dir = os.path.join(src_dir, 'components/modules')
    if not os.path.exists(modules_dir):
        return []
    
    bleeds = []
    modules = [d for d in os.listdir(modules_dir) if os.path.isdir(os.path.join(modules_dir, d))]
    
    for module in modules:
        module_path = os.path.join(modules_dir, module)
        files = get_all_files(module_path)
        
        for f in files:
            with open(f, 'r', errors='ignore') as file_content:
                content = file_content.read()
                for other_module in modules:
                    if other_module == module:
                        continue
                    
                    # Look for imports from other modules
                    # e.g. '@/components/modules/tenants/...'
                    # e.g. '../tenants/...'
                    patterns = [
                        rf"from ['\"].*?modules/{other_module}/",
                        rf"from ['\"].*?/{other_module}/" # Risk of false positives if common name
                    ]
                    
                    # Be specific to avoid false positives
                    specific_pattern = rf"from ['\"].*?modules/{other_module}/"
                    if re.search(specific_pattern, content):
                        bleeds.append(f"{os.path.relpath(f, src_dir)} imports from {other_module}")
    return bleeds

def check_ui_purity(src_dir):
    system_dir = os.path.join(src_dir, 'components/system')
    if not os.path.exists(system_dir):
        return []
    
    violations = []
    files = get_all_files(system_dir)
    
    for f in files:
        with open(f, 'r', errors='ignore') as file_content:
            content = file_content.read()
            # Flag imports from actions or services
            # Also check for direct prisma usage if any
            if any(x in content for x in ['src/actions/', 'src/services/', '@/src/actions/', '@/src/services/', '@/actions/', '@/services/']):
                violations.append(f)
    return violations

if __name__ == "__main__":
    workspace_root = "/Users/rajumaharjan/Documents/Anit Gravity Projects/Rent And Expenses Mgmt System"
    src_dir = os.path.join(workspace_root, "src")
    
    print("Executing Sweep...")
    dead = find_dead_files(src_dir, workspace_root)
    bleeds = check_architectural_bleeds(src_dir)
    purity = check_ui_purity(src_dir)
    
    report_path = os.path.join(workspace_root, "GLOBAL_PURITY_AND_GARBAGE_REPORT.md")
    with open(report_path, 'w') as report:
        report.write("# GLOBAL PURITY AND GARBAGE REPORT\n\n")
        report.write("Generated at: 2026-04-30\n\n")
        
        report.write("## 1. The Boneyard (Dead / Orphaned Files)\n")
        report.write("> Files identified in `components/`, `hooks/`, or `lib/` that have zero active imports across the codebase.\n\n")
        if dead:
            for d in sorted(dead):
                report.write(f"- `{os.path.relpath(d, workspace_root)}`\n")
        else:
            report.write("_No dead files detected._\n")
            
        report.write("\n## 2. Architectural Bleeds (Cross-Domain Imports)\n")
        report.write("> Instances where a business module directly imports from another business module (violating domain isolation).\n\n")
        if bleeds:
            for b in sorted(bleeds):
                report.write(f"- {b}\n")
        else:
            report.write("_No architectural bleeds detected._\n")
            
        report.write("\n## 3. Purity Violations (Dumb UI with Logic)\n")
        report.write("> System UI components (Axiom V2) found to be importing data actions or services.\n\n")
        if purity:
            for p in sorted(purity):
                report.write(f"- `{os.path.relpath(p, workspace_root)}`\n")
        else:
            report.write("_No purity violations detected._\n")
            
    print(f"Audit complete. Report generated at {report_path}")

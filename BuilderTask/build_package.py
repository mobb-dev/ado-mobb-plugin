import json
import shutil
import subprocess
import sys
from pathlib import Path

# Define important paths
CURRENT_DIR = Path(__file__).resolve().parent #BuilderTask
ROOT_DIR = CURRENT_DIR.parent                  # ado-mobb-plugin/
MOBB_DIR = ROOT_DIR / "MobbAutofixer" / "0.1.0"

# JSON files
REFERENCE_JSON = CURRENT_DIR / "reference.json"
TASK_PREVIEW_JSON = CURRENT_DIR / "task-preview.json"
TASK_PRODUCTION_JSON = CURRENT_DIR / "task-production.json"
VSS_EXTENSION_PREVIEW_JSON = CURRENT_DIR / "vss-extension-preview.json"
VSS_EXTENSION_PRODUCTION_JSON = CURRENT_DIR / "vss-extension-production.json"

# Destination files
TASK_JSON = MOBB_DIR / "task.json"
VSS_EXTENSION_JSON = ROOT_DIR / "vss-extension.json"

def load_json(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

def save_json(data, file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)
        f.write('\n')  # For prettier ending

def run_command(cmd, description):
    print(f"\n🔧 {description}")
    try:
        subprocess.run(cmd, shell=True, check=True)
        print("✅ Success")
    except subprocess.CalledProcessError:
        print(f"❌ Failed: {description}")
        sys.exit(1)

def update_reference_versions():
    ref = load_json(REFERENCE_JSON)
    ref["currentTaskVersion"]["Patch"] += 1
    ref["currentVSSExtensionVersion"] = f"0.1.{ref['currentTaskVersion']['Patch']}"
    save_json(ref, REFERENCE_JSON)
    print(f"🔢 Updated reference.json to patch {ref['currentTaskVersion']['Patch']}")
    return ref["currentTaskVersion"]["Patch"]

def update_preview_files(new_patch_version):
    # Update task-preview.json
    task_preview = load_json(TASK_PREVIEW_JSON)
    task_preview["version"]["Patch"] = new_patch_version
    save_json(task_preview, TASK_PREVIEW_JSON)

    # Update vss-extension-preview.json
    vss_preview = load_json(VSS_EXTENSION_PREVIEW_JSON)
    vss_preview["version"] = f"0.1.{new_patch_version}"
    save_json(vss_preview, VSS_EXTENSION_PREVIEW_JSON)

    print("🛠️ Updated preview JSONs")

def update_production_files(new_patch_version):
    # Update task-production.json
    task_prod = load_json(TASK_PRODUCTION_JSON)
    task_prod["version"]["Patch"] = new_patch_version
    save_json(task_prod, TASK_PRODUCTION_JSON)

    # Update vss-extension-production.json
    vss_prod = load_json(VSS_EXTENSION_PRODUCTION_JSON)
    vss_prod["version"] = f"0.1.{new_patch_version}"
    save_json(vss_prod, VSS_EXTENSION_PRODUCTION_JSON)

    print("🛠️ Updated production JSONs")

def copy_file(src, dest):
    shutil.copy(src, dest)
    print(f"📄 Copied {src.name} to {dest}")

def build_preview():
    print("\n🚀 Building PREVIEW package...")
    copy_file(TASK_PREVIEW_JSON, TASK_JSON)
    copy_file(VSS_EXTENSION_PREVIEW_JSON, "vss-extension-preview.json")

    run_command(
        "tsc --project .\\tsconfig.json && tsc --project .\\MobbAutofixer\\0.1.0\\dist\\tsconfig.json && npx webpack && tfx extension create --manifest-globs vss-extension-preview.json --no-ignore false",
        "Build Preview VSIX"
    )

def build_production():
    print("\n🚀 Building PRODUCTION package...")
    copy_file(TASK_PRODUCTION_JSON, TASK_JSON)
    copy_file(VSS_EXTENSION_PRODUCTION_JSON, "vss-extension-production.json")

    run_command(
        "tsc --project .\\tsconfig.json && tsc --project .\\MobbAutofixer\\0.1.0\\dist\\tsconfig.json && npx webpack && tfx extension create --manifest-globs vss-extension-production.json --no-ignore false",
        "Build Production VSIX"
    )

def main():
    print("🏗️ Starting Build Process...")

    new_patch = update_reference_versions()
    
    update_preview_files(new_patch)
    update_production_files(new_patch)

    build_preview()
    build_production()

    print("\n🎉 All done!")

if __name__ == "__main__":
    main()

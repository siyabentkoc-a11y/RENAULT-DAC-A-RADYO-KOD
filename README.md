# Renault Radio EXE Builder (for GitHub Actions)

## What this repo does
This repository is prepared so that when you upload it to a GitHub repository, the included GitHub Actions workflow will automatically build a **Windows .exe** using `pkg` and attach it as a downloadable artifact.

You do **NOT** need to run commands locally. You only need a free GitHub account and to upload these files via the GitHub website.

## Steps (simple, click-only):
1. Sign in or create a free GitHub account at https://github.com.
2. Create a new repository (any name).
3. On the new repo page, click **Add file → Upload files**, then drag & drop *all files from this ZIP* and Commit.
4. After commit, click the **Actions** tab in the repo. GitHub will run the workflow automatically.
5. When the workflow run finishes, open the specific run and download the built artifact `renault-exe-win64.zip` from the **Artifacts** section.
6. Unzip and run `renault_radio_code_fetcher.exe` (double-click). The program opens in a console window. Type the PRECODE after `.exe`, e.g. run from cmd: `renault_radio_code_fetcher.exe V589`
   - If you prefer a simple GUI wrapper, tell me and I'll add a small GUI and rebuild instructions.

If the Actions tab shows an error, copy the "build log" and paste it back to me; I'll help fix it.


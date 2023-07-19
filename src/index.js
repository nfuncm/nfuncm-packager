
const fs = require("node:fs");
const path = require("node:path");
const { minify } = require("terser");

module.exports = async function main(opts) {
  try {
    let cwd = process.cwd();
    let usersPack = JSON.parse(fs.readFileSync(path.join(cwd, "package.json")));
    let licenseExists = [ "LICENSE", "LICENSE.md", "license", "license.md" ].map(localPath =>
        path.join(cwd, localPath)
    ).find(f => fs.existsSync(f));

    let license = null;

    if (licenseExists) {
      license = fs.readFileSync(licenseExists, { encoding: "utf8" });
    }

    let generatedComment = "/**\n";

    if (typeof usersPack?.name === "string") {
      generatedComment += `  * ${usersPack.name}\n`;
    }
    if (typeof usersPack?.version === "string") {
      generatedComment += `  * Version: ${usersPack.version}\n`;
    }
    if (typeof usersPack?.description === "string") {
      generatedComment += `  *\n  * ${usersPack.description}\n  *\n`;
    }
    if (typeof usersPack?.author === "string") {
      generatedComment += `  * Author: ${usersPack.author}\n`;
    } // TODO else if support for author object
    if (typeof usersPack?.license === "string") {
      generatedComment += `  * License: ${usersPack.license}\n`;
    } else if (licenseExists) {
      // THe users didn't put a license in the package.json but has one in their repo
      // lets add that instead
      let licenseArray = license.split("\n");

      for (let i = 0; i < licenseArray.length; i++) {
        generatedComment += `  * ${licenseArray[i]}\n`;
      }
    }

    // Now to save this to the file, after determining if that file is available
    if (typeof usersPack?.main === "string") {
      let mainFile = fs.readFileSync(path.join(cwd, usersPack.main), { encoding: "utf8" });

      if (mainFile.includes(generatedComment)) {
        console.log("Looks like this comment is already included, aborting...");
        process.exit(1);
      }

      let mainFileToWrite = generatedComment + "  *\n  */\n\n" + mainFile;

      if (typeof usersPack?.nfm?.minify === "string" || (typeof usersPack?.nfm?.minify === "boolean" && usersPack.nfm.minify) || typeof usersPack?.nfm?.minify === "object") {
        // The user would like their file minified as well

        let options = typeof usersPack?.nfm?.minify === "object" ? usersPack.nfm.minify : {
          sourceMap: false,
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        };

        let minifiedCode = await minify(mainFileToWrite, options);

        // Lets now add our comment to the top

        let minifiedCodeToWrite = generatedComment + "  *\n  */\n\n" + minifiedCode.code;

        let saveLocation = typeof usersPack?.nfm?.minify === "string" ? usersPack.nfm.minify : `./dist/${path.parse(usersPack.main).base}`;

        // First check if dir exists, and create it if not
        if (!fs.existsSync(path.join(cwd, path.parse(saveLocation).dir))) {
          fs.mkdirSync(path.join(cwd, path.parse(saveLocation).dir));
        }

        fs.writeFileSync(path.join(cwd, saveLocation), minifiedCodeToWrite);

        console.log("Done...");
      } else {
        // There is nothing else to do. We will save our changes directly to the file
        fs.writeFileSync(path.join(cwd, usersPack.main), mainFileToWrite);

        // Success!
        console.log("Done...");
      }

    } else {
      console.log("Unable to determine where to save package details. Make sure you have set `main` in your `package.json`");
      process.exit(1);
    }
  } catch(err) {
    console.log("An error occured while packaging your function!");
    console.log(err);
    process.exit(1);
  }

};

A personal website of miscellany: http://dansmith65.com.

## Build Notes

I don't add to my blog often, so I'm likely to forget all this stuff if I don't record it somewhere. I plan to re-read this every 6 months or so to remind myself wtf I was thinking...

Am using https://www.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/ as a guide for using npm as a build tool. Prior to making this change, I used a `_build.cmd` file to set a few environment variables, then call jekyll build. I also used `_serve.cmd` to run jekyll serve, which was just a handy way to open a new terminal and serve the site while testing locally.

That method was sufficient for starting out, but then I added [validate-tags.txt] and [validate-years.txt]. Both of those could produce a list of tags or years that need files created for them for the blog to work properly. Since I didn't have a build process, I couldn't parse the output of those files and automatically create the necessary files. Instead, I resorted to triggering a build error so I knew to find out what the missing tags/years are and manually create the files. Between this, and wanting to start adding images to by blog, I started looking into build processes and settled on [npm-scripts].

Relevant npm commands:

* `npm install` to install dependencies
* `npm start` alias to `npm run start`, builds/serves/watches for changes
* `npm run build` builds the site and validates tags/years files
* `npm run env` built-in command that lists environment variables available to the script at runtime
* refer to "scripts" in [package.json] for additional commands that can be called via `npm run [script]`
* `npm run serve:dev` and `npm run build:dev` can currently be used to reference source js instead of minified. I can reference the `jekyll.environment` Liquid tag anywhere I want development-specific output.

## Pictures

Node script in this repo will process source images, creating multiple copies as needed for this blog. Source images are defined as a list of paths (on my local system) in a text file like: [_data/pictures/2018/motorcycle-rebuild-xs1100.txt](./_data/pictures/2018/motorcycle-rebuild-xs1100.txt). Where "2018" is the year from the post, and "motorcycle-rebuild-xs1100" is the post slug. Each line can contain one of three values: a file path, a gallery name prefixed with "#", or blank which will be skipped. Once a file is created, `npm run process-pictures` will read that file and put the resulting pictures in [assets/pictures/2018/motorcycle-rebuild-xs1100](./assets/pictures/2018/motorcycle-rebuild-xs1100). To include those pictures in the post, use: `{% include picture-gallery.html gallery="" %}`, where gallery can be empty to include the images that were not part of a gallery, or the gallery name.
The process-pictures script will create a json file that is used by the include to get the path to/sizes of pictures. If you update the source txt file, all the pictures and the json file will automatically be re-created. Similarly, if the json file is deleted, all pictures and the json file will be re-created. Because of this automatic creation proces, both the _data/pictures/ and the assets/pictures/ folders should probably not be used for anything other than pictures managed automatically by this script.


[validate-tags.txt]: ../df25000a19cb4fe79979c519332969fc4be9ac5a/validate-tags.txt
[validate-years.txt]: ../df25000a19cb4fe79979c519332969fc4be9ac5a/validate-years.txt
[package.json]: ./package.json
[npm-scripts]: https://docs.npmjs.com/misc/scripts

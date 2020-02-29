const Generator = require("yeoman-generator");
const _ = require("lodash");
const path = require("path");
const extend = _.merge;
const globby = require("globby");
const originUrl = require("git-remote-origin-url");

module.exports = class extends Generator {
  constructor(args, options) {
    super(args, options);
    this.option("name", {
      type: String,
      required: true,
      defaults: "",
      alias: "n",
      desc: "包名"
    });
    this.option("dest", {
      type: String,
      required: true,
      defaults: this.destinationPath(),
      alias: "d",
      desc: "生成目录"
    });
  }

  async initializing() {
    this.dest = this.options.dest;
    this.resolve = p => path.resolve(this.dest, p);
    const curPkg = this.fs.readJSON(this.resolve("package.json"), {});
    this.pkg = extend(
      {
        name: this.options.name,
        description: "A pluggable vue project powered by vxp.",
        version: "1.0.0-alpha",
        private: true,
        workspaces: ["packages/*"],
        scripts: {
          vxp: "vxp"
        },
        dependencies: {},
        devDependencies: {},
        license: "MIT",
        keywords: ["vxp", "vue", "pluggable"],
        author: this.user.git.name(),
        email: this.user.git.email()
      },
      curPkg
    );

    this.templateFiles = await globby(["**/*"], { cwd: this.templatePath() });

    return originUrl(this.destRoot)
      .then(url => {
        this.pkg.homepage = url;
      })
      .catch(() => {
        this.pkg.homepage = "";
      });
  }

  prompting() {}

  default() {}

  writing() {
    this.templateFiles.forEach(_f => {
      if (path.extname(_f) === ".ejs") {
        this.fs.copyTpl(
          this.templatePath(_f),
          this.resolve(_f.replace(/\.ejs$/, "")),
          this.pkg
        );
      } else {
        this.fs.copy(this.templatePath(_f), this.resolve(_f));
      }
    });
    this.fs.writeJSON(this.resolve("package.json"), this.pkg);
  }

  install() {
    // this.yarnInstall();
  }
};

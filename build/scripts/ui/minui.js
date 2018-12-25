/**
 * Auth: lijiang
 * Date: 2018/3/21
 * Description: minui
 */
const spawn = require('child_process');
const utils = require('../utils/utils');
const yamlParser = require('js-yaml');
const fs = require('fs');
const path = require('path');

const EXTERNAL_MIN_UI = path.resolve() + '/dist/external/ui/minui/';

const cmdTpl = 'min install @minui/';
const componentsConfig = '/config/components.yaml';
const UIName = 'minui';

exports.install = () => {
  // installCom();
  let configPath = `${path.resolve()}${componentsConfig}`;
  let fileContent = fs.readFileSync(configPath, 'utf8');
  let yaml = yamlParser.safeLoad(fileContent);
  yaml.forEach((ui) => {
    if (ui.componentsProject === UIName) {
      installCom(ui.list);
    }
  });
};

const installCom = (components) => {
  let cursor = components.length - 1;
  components.forEach((com, i) => {
    let cmd = cmdTpl + com.name;
    spawn.exec(cmd, () => {
      if (i === cursor) {
        utils.print(`install minui components`, 'green');
      }
    });
  });
};

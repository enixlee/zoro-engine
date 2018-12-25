/**
 * Auth: lijiang
 * Date: 2018/3/1
 * Description: network
 */
const yaml = require('js-yaml');
const utils = require('../utils/utils');
const fs = require('fs');
const lodash = require('lodash');

let networkConfigPath = `/config/network.yaml`;
let networkOutputPath = `/config/app/Network.js`;

exports.compile = (config) => {
  let projectPath = config['PROJECT_PATH'];
  let filePath = `${projectPath}${networkConfigPath}`;

  let content = fs.readFileSync(filePath, 'utf8');
  let networkConfig = yaml.safeLoad(content);

  let network = makeNetworkParams(networkConfig);
  let outputPath = `${projectPath}${networkOutputPath}`;
  fs.writeFileSync(outputPath, network, 'utf8');

  utils.print('compile bala mini program window config complete!');
};

const makeNetworkParams = (network) => {
  let keys = lodash.keys(network);
  let paramsCount = keys.length;
  let content = '';
  lodash.map(keys, function (v, k) {
    let tpl = networkPramsTemplate;
    tpl = tpl.replace(/{{key}}/g, v);
    tpl = tpl.replace(/{{value}}/g, utils.transferYamlValue(network[v]));
    content += `  ${tpl}`;
    if (paramsCount !== k + 1) {
      content += ',\n';
    }
  });
  return networkTemplate.replace(/{{content}}/g, content);
};

const networkTemplate = `module.exports = {
{{content}}
};
`;

const networkPramsTemplate = `{{key}}: {{value}}`;

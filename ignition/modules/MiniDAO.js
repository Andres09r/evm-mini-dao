const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MiniDAOModule", (m) => {
  const miniDAO = m.contract("MiniDAO");

  return { miniDAO };
});


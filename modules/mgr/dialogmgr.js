export default class HMDialogMgr {
    getDialog(dataset, caller=null) {
        const name = dataset.dialog;
        if (name === 'atk')      { return this.getAttackDialog(dataset, caller)  } else
        if (name === 'dmg')      { return this.getDamageDialog(dataset, caller)  } else
        if (name === 'def')      { return this.getDefendDialog(dataset, caller)  } else
        if (name === 'skill')    { return this.getSkillDialog(dataset, caller)   } else
        if (name === 'ability')  { return this.getAbilityDialog(dataset, caller) } else
        if (name === 'wound')    { return this.setWoundDialog(caller)            }
    }

    _focusById(id) {
        return setTimeout(() => { document.getElementById(id).focus() }, 50);
    }

    getWeapons(actor, itemId) {
        if (itemId) return [actor.items.get(itemId)];
        return actor.items.filter((a) => a.type === "weapon");
    }

    async setWoundDialog(caller) {
        const dialogResp = {caller};
        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: game.i18n.localize("HM.dialog.setWoundTitle"),
                content: await renderTemplate("systems/hackmaster5e/templates/dialog/setWound.hbs"),
                buttons: {
                    wound: {
                        label: game.i18n.localize("HM.dialog.setWoundTitle"),
                        callback: () => {
                            resolve({
                                "value": parseInt(document.getElementById("hp").value)
                            })
                        }
                    }
                },
                default: "wound"
            }, {width: 175}).render(true);
            this._focusById('hp');
        });
        return dialogResp;
    }

    async getAttackDialog(dataset, caller) {
        const dialogData = {};
        const dialogResp = {caller};

        dialogData.weapons = this.getWeapons(caller, dataset?.itemId);
        const template = "systems/hackmaster5e/templates/dialog/getAttack.hbs";

        let widx = null;
        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: caller.name + game.i18n.localize("HM.dialog.getAttackTitle"),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    attack: {
                        label: game.i18n.localize("HM.attack"),
                        callback: (html) => {
                            widx = html.find('#weapon-select')[0].value;
                            resolve({
                                "mod": parseInt(document.getElementById("mod").value || 0),
                            })
                        }
                    }
                },
                default: "attack"
            }).render(true);
            this._focusById('mod');
        });
        dialogResp.context = dialogData.weapons[widx];
        return dialogResp;
    }

    async getDamageDialog(dataset, caller) {
        const dialogData = {};
        const dialogResp = {caller};

        dialogData.weapons = this.getWeapons(caller, dataset?.itemId);
        const template = "systems/hackmaster5e/templates/dialog/getDamage.hbs";

        let widx = null;
        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: caller.name + game.i18n.localize("HM.dialog.getDamageTitle"),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    normal: {
                        label: game.i18n.localize("HM.normal"),
                        callback: (html) => {
                            widx = html.find('#weapon-select')[0].value;
                            resolve({
                                "shieldhit": false,
                                "dmg": dialogData.weapons[widx].data.data.dmg.normal,
                                "mod": parseInt(document.getElementById("mod").value || 0)
                            })
                        }
                    },
                    shield: {
                        label: game.i18n.localize("HM.shield"),
                        icon: '<i class="fas fa-shield-alt"></i>',
                        callback: (html) => {
                            widx = html.find('#weapon-select')[0].value;
                            resolve({
                                "shieldhit": true,
                                "dmg": dialogData.weapons[widx].data.data.dmg.shield,
                                "mod": parseInt(document.getElementById("mod").value || 0)
                            })
                        }
                    }
                },
                default: "normal"
            }).render(true);
            this._focusById('mod');
        });
        dialogResp.context = dialogData.weapons[widx];
        return dialogResp;
    }

    async getDefendDialog(dataset, caller) {
        const dialogData = {};
        const dialogResp = {caller};

        dialogData.weapons = this.getWeapons(caller, dataset?.itemId);
        const template = "systems/hackmaster5e/templates/dialog/getDefend.hbs";

        let widx = null;
        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: caller.name + game.i18n.localize("HM.dialog.getDefendTitle"),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    defend: {
                        label: game.i18n.localize("HM.defend"),
                        callback: (html) => {
                            widx = html.find('#weapon-select')[0].value;
                            resolve({
                                "mod": parseInt(document.getElementById("mod").value || 0)
                            })
                        }
                    }
                },
                default: "defend"
            }).render(true);
            this._focusById('mod');
        });
        dialogResp.context = dialogData.weapons[widx];
        return dialogResp;
    }

    async getSkillDialog(dataset, caller) {
        const dialogData = {};
        const dialogResp = {caller};

        dialogData.skill = caller.items.get(dataset.itemId);
        const template = "systems/hackmaster5e/templates/dialog/getSkill.hbs";

        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: caller.name + ": " + dialogData.skill.name + game.i18n.localize("HM.dialog.getSkillTitle"),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    standard: {
                        label: game.i18n.localize("HM.skillcheck"),
                        callback: () => {
                            resolve({
                                "opposed": false,
                                "mod": parseInt(document.getElementById("mod").value || 0)
                            })
                        }
                    },
                    opposed: {
                        label: game.i18n.localize("HM.opposedcheck"),
                        callback: () => {
                            resolve({
                                "opposed": true,
                                "mod": parseInt(document.getElementById("mod").value || 0)
                            })
                        }
                    }
                },
                default: "standard"
            }).render(true);
            this._focusById('mod');
        });
        dialogResp.context = dialogData.skill;
        dialogResp.resp.oper = dialogResp.resp.opposed ? "+" : "-";
        return dialogResp;
    }

    async getAbilityDialog(dataset, caller) {
        const dialogData = {};
        const dialogResp = {caller};

        dialogData.ability = dataset.ability;
        const template = "systems/hackmaster5e/templates/dialog/getAbility.hbs";

        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: caller.name + ": " + dialogData.ability + " " + game.i18n.localize("HM.roll"),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    save: {
                        label: game.i18n.localize("HM.dialog.getAbilityButtonL"),
                        callback: () => {
                            resolve({
                                "save": true,
                                "mod": parseInt(document.getElementById("mod").value || 0)
                            })
                        }
                    },
                    check: {
                        label: game.i18n.localize("HM.dialog.getAbilityButtonR"),
                        callback: () => {
                            resolve({
                                "save": false,
                                "mod": parseInt(document.getElementById("mod").value || 0)
                            })
                        }
                    }
                },
                default: "save"
            }).render(true);
            this._focusById('mod');
        });
        dialogResp.context = caller;
        dialogResp.resp.oper = dialogResp.resp.save ? "+" : "-";
        return dialogResp;
    }
}

import { HMActorSheet } from './actor-sheet.js';

function updateSflags(item, sflags) {
    const flag = sflags;
    if (item.data.state.innate.checked)   { flag.innate = true;     } else
    if (item.data.state.equipped.checked) { flag.equipped = true;   } else
    if (item.data.state.carried.checked)  { flag.unequipped = true; }
}

export class HMCharacterActorSheet extends HMActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'actor'],
            template: 'systems/hackmaster5e/templates/actor/actor-base.hbs',
            width: 820,
            height: 950,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'skills' }]
        });
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        const data = super.getData();
        data.dtypes = ['String', 'Number', 'Boolean'];

        // Prepare items.
        if (this.actor.data.type === 'character') {
            this._prepareCharacterItems(data);
        }

        return data;
    }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
    async _prepareCharacterItems(sheetData) {
        const actorData = sheetData.actor;

        // Initialize containers.
        const armors = [];
        const uskills = [];
        const skills = [];
        const langs = [];
        const gear = [];
        const spells = [];
        const wounds = [];
        const weapons = [];
        const profs = [];
        const features = [];

        let race = null;
        let cclass = null;

        const sflags = {
            combat: {
                weapon: {innate: false, equipped: false, unequipped: false},
                armor:  {innate: false, equipped: false, unequipped: false},
            },
        };

        // Iterate through items, allocating to containers
        for (const i of sheetData.items) {
            i.img = i.img || DEFAULT_TOKEN;
            if (i.type === 'armor') {
                updateSflags(i, sflags.combat.armor);
                gear.push(i);
                armors.push(i);
            } else
            if (i.type === 'cclass')      { cclass = i;    } else
            if (i.type === 'item')        { gear.push(i);  } else
            if (i.type === 'proficiency') { profs.push(i); } else
            if (i.type === 'skill') {
                if (i.data.language.checked) {
                    langs.push(i);
                } else {
                    i.data.universal.checked ? uskills.push(i) : skills.push(i);
                }
            } else
            if (i.type === 'spell')  { spells.push(i);     } else
            if (i.type === 'race')   { race = i;           } else
            if (i.type === 'weapon') {
                updateSflags(i, sflags.combat.weapon);
                gear.push(i);
                weapons.push(i);
            } else
            if (i.type === 'wound')  { wounds.push(i);     }
        }

        // Sort
        skills.sort((a, b) => {return a.name > b.name ? 1 : -1;});
        uskills.sort((a, b) => {return a.name > b.name ? 1 : -1;});
        langs.sort((a, b) => {return a.name > b.name ? 1 : -1;});

        // Assign
        actorData.armors = armors;
        actorData.gear = gear;
        actorData.skills = {skills, uskills, langs};
        actorData.features = features;
        actorData.spells = spells;
        actorData.wounds = wounds;
        actorData.weapons = weapons;
        actorData.profs = profs;
        actorData.race = race;
        actorData.cclass = cclass;
        actorData.sflags = sflags;

        for (let i=0; i < actorData.weapons.length; i++) {
            const wData = actorData.weapons[i].data;
            wData.cclass = actorData.cclass;
            for (const stat in wData.stats) {
                wData.stats[stat].race = actorData.race.data?.[stat] || {value: 0};
            }
        }
    }
}

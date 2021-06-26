import { HMActor } from './modules/actor/actor.js';
import { HMCharacterActorSheet } from './modules/actor/character-actor-sheet.js';
import { HMItem } from './modules/item/item.js';
import { HMItemSheet } from './modules/item/item-sheet.js';
import { HMCombat, HMCombatTracker } from './modules/sys/combat.js';
import { HMMacro } from './modules/sys/macro.js';
import LOGGER from './modules/sys/logger.js';

import registerHandlebarsHelpers from './modules/sys/helpers.js';
import preloadHandlebarsTemplates from './modules/sys/partials.js';

import './modules/sys/dice.js';

Hooks.once('init', async() => {
    LOGGER.log('+++ Init');

    CONFIG.Actor.documentClass = HMActor;
    CONFIG.Item.documentClass = HMItem;
    CONFIG.Combat.documentClass = HMCombat;
    CONFIG.ui.combat = HMCombatTracker;
    CONFIG.Macro.documentClass = HMMacro;

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('hackmaster', HMCharacterActorSheet, { makeDefault: true });

    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('hackmaster', HMItemSheet, { makeDefault: true });

    registerHandlebarsHelpers();
    preloadHandlebarsTemplates();

    LOGGER.log('--- Init');
});

Hooks.once('ready', async() => {
    // render a sheet to the screen as soon as we enter, for testing purposes.
    if (game.items.contents[0]) {
    }
    if (game.actors.contents[0]) {
        game.actors.contents[0].sheet.render(true);
    }
});

Hooks.on('createActor', HMActor.createActor);
Hooks.on('renderCombatTracker', HMCombatTracker.renderCombatTracker);

Hooks.on('diceSoNiceRollStart', (messageId, context) => {
    // Add 1 to penetration dice so dsn shows actual die throws.
    const normalize = (roll, r=5) => {
        if (r < 0) {
            LOGGER.warn('Normalize recursion limit reached.');
            return;
        }

        for (let i = 0; i < roll.terms.length; i++) {
            // PoolTerms contain sets of terms we need to evaluate.
            if (roll.terms[i]?.rolls) {
                for (let j = 0; j < roll.terms[i].rolls.length; j++) {
                    normalize(roll.terms[i].rolls[j], --r);
                }
            }

            let penetrated = false;
            for (let j = 0; j < roll.terms[i]?.results?.length; j++) {
                const result = roll.terms[i].results[j];
                if (penetrated && j) result.result++;
                penetrated = result.penetrated;
            }
        }
    };
    normalize(context.roll);
});

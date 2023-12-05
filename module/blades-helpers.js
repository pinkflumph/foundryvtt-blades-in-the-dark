export class BladesHelpers {

  /**
   * Identifies duplicate items by type and returns a array of item ids to remove
   *
   * @param {Object} item_data
   * @param {Document} actor
   * @returns {Array}
   *
   */
  static removeDuplicatedItemType(item_data, actor) {
    let dupe_list = [];
    let distinct_types = ["crew_type", "crew_reputation", "class", "vice", "background", "heritage"];
    let allowed_types = ["item"];
    let should_be_distinct = distinct_types.includes(item_data.type);
    // If the Item has the exact same name - remove it from list.
    // Remove Duplicate items from the array.
    actor.items.forEach( i => {
      let has_double = (item_data.type === i.type);
      if ( ( ( i.name === item_data.name ) || ( should_be_distinct && has_double ) ) && !( allowed_types.includes( item_data.type ) ) && ( item_data._id !== i.id ) ) {
        dupe_list.push (i.id);
      }
    });

    return dupe_list;
  }

  /**
   * Get a nested dynamic attribute.
   * @param {Object} obj
   * @param {string} property
   */
  static getNestedProperty(obj, property) {
    return property.split('.').reduce((r, e) => {
        return r[e];
    }, obj);
  }


  /**
   * Add item functionality
   */
  static _addOwnedItem(event, actor) {

    event.preventDefault();
    const a = event.currentTarget;
    const item_type = a.dataset.itemType;

    let data = {
      name: randomID(),
      type: item_type
    };
    return actor.createEmbeddedDocuments("Item", [data]);
  }

  /**
   * Get the list of all available ingame items by Type.
   *
   * @param {string} item_type
   * @param {Object} game
   */
  static async getAllItemsByType(item_type, game) {

    let list_of_items = [];
    let game_items = [];
    let compendium_items = [];

    game_items = game.items.filter(e => e.type === item_type).map(e => {return e.toObject()});

    let pack = game.packs.find(e => e.metadata.name === item_type);
    let compendium_content = await pack.getDocuments();
    compendium_items = compendium_content.map(e => {return e.toObject()});

    list_of_items = game_items.concat(compendium_items);
    list_of_items.sort(function(a, b) {
      let nameA = a.name.toUpperCase();
      let nameB = b.name.toUpperCase();
      return nameA.localeCompare(nameB);
    });
    return list_of_items;

  }

  /* -------------------------------------------- */

  /**
   * Returns the label for attribute.
   *
   * @param {string} attribute_name
   * @returns {string}
   */
  static getAttributeLabel(attribute_name) {
        let attribute_labels = {};
        const attributes = game.system.model.Actor.character.attributes;

        for (const att_name in attributes) {
          attribute_labels[att_name] = attributes[att_name].label;
          for (const skill_name in attributes[att_name].skills) {
            attribute_labels[skill_name] = attributes[att_name].skills[skill_name].label;
          }

        }

        return attribute_labels[attribute_name];
  }

  /**
   * Returns the label for roll type.
   *
   * @param {string} roll_name
   * @returns {string}
   */
  static getRollLabel(roll_name) {
    let attribute_labels = {};
    const attributes = game.system.model.Actor.character.attributes;

    for (const att_name in attributes) {
      if (att_name == roll_name) {
        return attributes[att_name].label;
      }
      for (const skill_name in attributes[att_name].skills) {
        if (skill_name == roll_name) {
          return attributes[att_name].skills[skill_name].label;
        }
      }
    }

    return roll_name;
  }

  /**
   * Returns true if the attribute is an action
   *
   * @param {string} attribute_name
   * @returns {Boolean}
   */
  static isAttributeAction(attribute_name) {
    const attributes = game.system.model.Actor.character.attributes;

    for (const att_name in attributes) {
      for (const skill_name in attributes[att_name].skills) {
        if (skill_name == attribute_name) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Returns true if the attribute is an attribute
   *
   * @param {string} attribute_name
   * @returns {Boolean}
   */
  static isAttributeAttribute(attribute_name) {
    const attributes = game.system.model.Actor.character.attributes;

    return (attribute_name in attributes);
  }

  /* -------------------------------------------- */

  /**
   * Creates options for faction clocks.
   *
   * @param {int[]} sizes
   *  array of possible clock sizes
   * @param {int} default_size
   *  default clock size
   * @param {int} current_size
   *  current clock size
   * @returns {string}
   *  html-formatted option string
   */
  static createListOfClockSizes( sizes, default_size, current_size ) {

    let text = ``;

    sizes.forEach( size => {
      text += `<option value="${size}"`;
      if ( !( current_size ) && ( size === default_size ) ) {
        text += ` selected`;
      } else if ( size === current_size ) {
        text += ` selected`;
      }

      text += `>${size}</option>`;
    });

    return text;

  }

  static clockToDataUri( type, value, fill_color ) {
    // Generate clock URL
    let clockUrl = "systems/blades-in-the-dark/styles/assets/progressclocks-svg/Progress Clock " + type + "-" + value + ".svg";
    
    // Read the file
    let request = new XMLHttpRequest();
    request.open('GET', clockUrl, true);
    request.responseType = 'blob';
    //return new Promise((resolve, reject) => {
      request.onload = function() {
          let reader = new FileReader();
         // reader.readAsText(request.response);
          reader.onloadend = () => {
            // Encode the SVG as a data URI
            const clockUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(reader.result.replace("var(--fill_color_default)",fill_color));
            return clockUri;
          };
          //reader.onerror = reject;
          reader.readAsText(request.response);
      };
    request.send();
    //}
    
//  async function createBlob(){
//  let response = await fetch('http://127.0.0.1:8080/test.jpg');
//  let data = await response.blob();
//  let metadata = {
//    type: 'image/jpeg'
//  };
//  let file = new File([data], "test.jpg", metadata);
  // ... do something with the file or return it
//}
//createFile();  
    
 //   let clockFile = new File(clockUrl);
 // fetch(clockFile).then(res => res.blob()).then(clockBlob => {
    // Read the file as a text string
 //   return new Promise((resolve, reject) => {
 //     let reader = new FileReader();
 //     reader.onloadend = () => {
 //       // Encode the SVG as a data URI
 //       const clockUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(reader.result.replace("var(--fill_color_default)",fill_color));
 //       resolve(clockUri);
 //     };
//      reader.onerror = reject;
//      reader.readAsText(clockFile);
 //   });
  //}
  }


  static clockUrlFromPar(type,value) {
    return "systems/blades-in-the-dark/styles/assets/progressclocks-svg/Progress Clock " + type + "-" + value + ".svg";
  }
}

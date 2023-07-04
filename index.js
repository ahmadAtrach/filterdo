import axios from 'axios';

/**
 * @class
 * Represents a Filterdo.
 */
class Filterdo {
  /**
   * @constructor
   * @param {string} apikey - The apikey for the Filterdo.
   */
  constructor(apikey) {
    this.apikey = apikey;
  }

  /**
   * @async
   * @param {string} message - The message to be sent for the filter.
   * @param {Array} arrayExample - The array to be filtered.
   * @return {Promise<Array>} The filtered array.
   */
  async filterByAi(message, arrayExample) {
    const response = await this.createChatMessage(message, arrayExample, this.apikey);
    try {
      // eslint-disable-next-line no-new-func
      const dynamicFunction = new Function('arr', `return (${response})(arr)`);
      const output = dynamicFunction(arrayExample);
      return output;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @async
   * @param {Array} array - The array to be filtered.
   * @param {string} message - The message to be sent for the filter.
   * @return {Promise<Array>} The filtered array.
   */
  async filter(array,message) {
    try {
      const result = await this.filterByAi(message, array);
      return result;
    } catch (error) {
      console.error(error);
    }
  }
  
  /**
   * @async
   * @param {string} condition - The condition for the chat message.
   * @param {Array} array - The array to be included in the chat message.
   * @param {string} apiKey - The apiKey for the chat message.
   * @return {Promise<string>} The generated response.
   */
  async createChatMessage(condition, array ,apiKey) {
    array = array[0];
    const jsonString = JSON.stringify(array);
    const generateResponse = async () => {
      const apiUrl = 'https://api.openai.com/v1/engines/text-davinci-003/completions';
      let output;
      const response = await axios.post(apiUrl, {
        prompt: 'Write a function called filterArray which takes just an array to filter an array like this one : '+ jsonString +' the condition is '+ condition +' give me just the function without any addtional text',
        max_tokens: 50,  // Set the desired response length
        n: 1,  // Generate a single response
        stop: null  // Keep generating until the max tokens limit is reached
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      const answer = response.data.choices[0]?.text.trim();
      output = answer;
      return this.extractFunctionBody(output);
    }
    return generateResponse();
  };

  /**
   * @param {string} codeString - The string to extract the function body from.
   * @return {string} The function body.
   */
  extractFunctionBody(codeString) {
    const functionKeywordIndex = codeString.indexOf('function');
    
    if (functionKeywordIndex === -1) {
      throw new Error('No "function" keyword found in the provided string.');
    }
  
    const functionBody = codeString.slice(functionKeywordIndex);
  
    return functionBody;
  }
}

export default Filterdo;

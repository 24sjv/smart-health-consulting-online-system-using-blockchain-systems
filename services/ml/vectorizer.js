/**
 * TF-IDF Vectorizer
 * Implements Term Frequency-Inverse Document Frequency for text processing
 * Used in machine learning for disease prediction from symptoms
 */

class TfIdfVectorizer {
  constructor() {
    this.documents = [];
    this.vocabulary = {};
    this.idf = {};
    this.fitted = false;
  }

  /**
   * Tokenize a text document into individual terms
   * @param {String} document - Text document to tokenize
   * @returns {Array} Array of terms
   */
  _tokenize(document) {
    // Simple tokenization by splitting on commas, spaces, and other punctuation
    return document.toLowerCase()
      .replace(/[^\w\s,]/g, '')
      .split(/,|\s+/)
      .filter(term => term.length > 0);
  }

  /**
   * Build vocabulary from documents and calculate IDF values
   * @param {Array} documents - Array of text documents
   */
  fit(documents) {
    this.documents = documents;
    const tokenizedDocs = documents.map(doc => this._tokenize(doc));
    
    // Build vocabulary
    let index = 0;
    tokenizedDocs.forEach(tokens => {
      // Get unique terms in document
      const uniqueTerms = [...new Set(tokens)];
      
      uniqueTerms.forEach(term => {
        if (!this.vocabulary.hasOwnProperty(term)) {
          this.vocabulary[term] = index++;
        }
      });
    });
    
    // Calculate IDF values
    const N = documents.length;
    Object.keys(this.vocabulary).forEach(term => {
      // Count documents containing the term
      const docsWithTerm = tokenizedDocs.filter(tokens => tokens.includes(term)).length;
      // IDF formula: log(N / (1 + docsWithTerm))
      this.idf[term] = Math.log(N / (1 + docsWithTerm)) + 1; // Add 1 to avoid divide by zero
    });
    
    this.fitted = true;
    return this;
  }

  /**
   * Transform documents into TF-IDF vectors
   * @param {Array} documents - Array of text documents to transform
   * @returns {Array} Array of TF-IDF vectors (as sparse representations)
   */
  transform(documents) {
    if (!this.fitted) {
      throw new Error('Vectorizer must be fitted before transform');
    }
    
    return documents.map(doc => {
      const tokens = this._tokenize(doc);
      const vector = {};
      
      // Calculate term frequencies
      const termFrequencies = {};
      tokens.forEach(term => {
        termFrequencies[term] = (termFrequencies[term] || 0) + 1;
      });
      
      // Calculate TF-IDF for each term
      Object.keys(termFrequencies).forEach(term => {
        if (this.vocabulary.hasOwnProperty(term)) {
          // TF * IDF
          const tf = termFrequencies[term] / tokens.length;
          vector[term] = tf * (this.idf[term] || 0);
        }
      });
      
      return vector;
    });
  }

  /**
   * Fit and transform in one step
   * @param {Array} documents - Array of text documents
   * @returns {Array} Array of TF-IDF vectors
   */
  fitTransform(documents) {
    this.fit(documents);
    return this.transform(documents);
  }
}

module.exports = {
  TfIdfVectorizer
};

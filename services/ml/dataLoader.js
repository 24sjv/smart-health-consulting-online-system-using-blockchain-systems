/**
 * Disease Data Loader
 * Loads and processes disease data for machine learning models
 */
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Class to handle loading and processing disease data
class DiseaseDataLoader {
  constructor() {
    this.diseasesPath = path.join(__dirname, '../../diseases.csv');
    this.diseases = [];
    this.symptomsIndex = {};
    this.initialized = false;
  }

  /**
   * Load disease data from CSV file
   */
  async loadData() {
    return new Promise((resolve, reject) => {
      try {
        const results = [];
        fs.createReadStream(this.diseasesPath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => {
            this.diseases = results;
            this._buildSymptomIndex();
            this.initialized = true;
            resolve(this.diseases);
          })
          .on('error', (error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Build an index of symptoms for efficient lookup
   * Maps each symptom to the diseases that have it
   */
  _buildSymptomIndex() {
    this.diseases.forEach(disease => {
      const symptoms = disease.Symptoms.split(', ').map(s => s.trim().toLowerCase());
      
      symptoms.forEach(symptom => {
        if (!this.symptomsIndex[symptom]) {
          this.symptomsIndex[symptom] = [];
        }
        this.symptomsIndex[symptom].push(disease);
      });
    });
  }

  /**
   * Get all unique symptoms from the dataset
   */
  getAllSymptoms() {
    return Object.keys(this.symptomsIndex);
  }

  /**
   * Get all diseases
   */
  getAllDiseases() {
    return this.diseases;
  }

  /**
   * Get a specific disease by ID
   */
  getDiseaseById(id) {
    return this.diseases.find(disease => disease.DiseaseID === id);
  }

  /**
   * Check if the data loader is initialized
   */
  isInitialized() {
    return this.initialized;
  }
}

// Create a singleton instance
const dataLoader = new DiseaseDataLoader();

module.exports = dataLoader;

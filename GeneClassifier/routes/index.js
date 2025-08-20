var express = require('express');
var router = express.Router();

//Positive classifications is a hashmap of each positive classification to its Cell Type
//Example: 'HLA-DR' => [ 'B Cells', 'Monocytes', 'M1-like Macrophages', 'Conventional DCs (cDCs)', 'Monocyte-derived DCs (moDCs)' ],
var positiveClassificationsToCellTypes = new Map();

//The test data contains a ton of other information not useful for this
var simplifiedTestData = new Map();

//Classifications is a hashmap of an Object ID to a list of positive classification cell types... I think that's the right terminology?
var classifications = new Map();

/* GET home page. */
router.get('/', async function (req, res, next) {
    var startTime = new Date();

    positiveClassificationsToCellTypes = ParseAndBuildClassificationDictionary();
    simplifiedTestData = ParseAndSimplifyTestData();
    classifications = await AssociatePositiveClassificationsToTestData();

    var endTime = new Date();

    console.log(classifications);

    res.render('index', {
        title: `WHY SCIENTISTS NO DATABASE BRAIN`,
        testData: simplifiedTestData,
        associatedData: classifications.entries(),
        calcTime: endTime.getMilliseconds() - startTime.getMilliseconds()
    });
});

router.get('/process', function (req, res, next) {
    res.render('process', {
        title: `PROCESSES`,
        data: AssociatePositiveClassificationsToTestData(),
    });
});

module.exports = router;

//For each classification list in the simplified test data I should be able to do a kvp lookup against positiveClassificationsToCellTypes
function AssociatePositiveClassificationsToTestData() {
    var associatedData = new Map();

    simplifiedTestData.forEach(simpleTestData => { associatedData.set(simpleTestData['Object ID'], GetClassificationFromData(simpleTestData['Classification'])); });

    return associatedData;
}
function GetClassificationFromData(sampleClassifications) {
    var sampleClassification = new Map();
    
    sampleClassifications.forEach(sc => { sampleClassification.set(sc, positiveClassificationsToCellTypes.get(sc)); });

    return sampleClassification;
}
function ParseAndBuildClassificationDictionary() {
    //TODO hard coded file path
    var classifications = GetJsonFileContents('C:\\Users\\merse\\source\\repos\\GeneClassifier\\GeneClassifier\\data\\qupath_cell_classification_with_trained_object_classifiers.json');
    var newPositiveClassifications = new Map();

    classifications.forEach(classification => Object.keys(classification).forEach(k => {
        if (classification[k] == 1)
            newPositiveClassifications.has(k) ? newPositiveClassifications.get(k).push(classification['Cell Type']) : newPositiveClassifications.set(k, [classification['Cell Type']]);
    }));

    return newPositiveClassifications;
}
function ParseAndSimplifyTestData() {
    //TODO hard coded file path
    var testData = GetJsonFileContents('C:\\Users\\merse\\source\\repos\\GeneClassifier\\GeneClassifier\\data\\test data set.json');
    var simplifiedData = [];

    testData.forEach(td => {
        simplifiedData.push({
            "Object ID": td["Object ID"],
            "Classification": td["Classification"].split(': '),
        });
    });

    return simplifiedData;
}
function GetJsonFileContents(filePath) {
    const fs = require('fs');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
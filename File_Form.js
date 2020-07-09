/* Notices: 
- GNU Lesser General Public License v2.1 (for p5) - This is for papaparse. 
  - Copyright (c) 1991, 1999 Free Software Foundation, Inc. 
- The MIT License (MIT)
  - Copyright (c) 2014 ml.js Michaël Zasso
  - Copyright (c) 2014-2016, Jon Schlinkert
  - Copyright (c) 2017 ml.js
  - Copyright (c) 2020 ml.js

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/ //This is the license for ml libraries.
/*The following modeling code is based on information from https://github.com/mljs/regression-simple-linear,
https://www.npmjs.com/package/ml-regression, https://www.npmjs.com/package/ml-logistic-regression?activeTab=readme, 
and https://github.com/mljs/logistic-regression.*/ 

//*Look at these libraries to see about copyrights.

/* NOTES: The modeling code is not a permanent fixture of this file. It served to test the 
interface's capabilities. Some things to note about the interface:

1) If you select and then de-select an input file without replacing it, you will eventually get an error.
This can be avoided by refreshing the page. 

2) Do not leave an input field blank. Put a 0 in the field instead.

3) There is code here for testing purposes that involves training models and working with
data. It will be commented out for now.
*/ 

import React, {useState} from 'react';
import Papa from 'papaparse';
import MLR from 'ml-regression-multivariate-linear';
import CanvasJSReact from './canvasjs.react';
import logistic from 'ml-logistic-regression';
//The use of 'const' rather than 'let' for an unchanged variable was influenced in part by https://www.npmjs.com/package/ml-logistic-regression.
const CanvasJSChart = CanvasJSReact.CanvasJSChart;
const {Matrix} = require('ml-matrix');


const FileData = () => { //This code sets state for controlled-yet-varying aspects of the interface.
    const [file, setFile] = useState('')
    const [file2, setFile2] = useState('');
    const [myData, setData] = useState([]);
    const [myInputs, setInputs] = useState([]);
    let [input1, setInput1] = useState(0);
    let [input2, setInput2] = useState(0);
    let [input3, setInput3] = useState(0);
    let [input4, setInput4] = useState(0);
    let [input5, setInput5] = useState(0);
    let [input6, setInput6] = useState(0);
    let [input7, setInput7] = useState(0);
    let [input8, setInput8] = useState(0);
    let [input9, setInput9] = useState(0);
    let [input10, setInput10] = useState(0);
    let [prediction, setPrediction] = useState();
    let [inputName1, setInputName1] = useState('Input 1');
    let [inputName2, setInputName2] = useState('Input 2');
    let [inputName3, setInputName3] = useState('Input 3');
    let [inputName4, setInputName4] = useState('Input 4');
    let [inputName5, setInputName5] = useState('Input 5');
    let [inputName6, setInputName6] = useState('Input 6');
    let [inputName7, setInputName7] = useState('Input 7');
    let [inputName8, setInputName8] = useState('Input 8');
    let [inputName9, setInputName9] = useState('Input 9');
    let [inputName10, setInputName10] = useState('Input 10');
    let [response, setResponse] = useState('');
    let [graph, setGraph] = useState(); 
    let [myPred, setPred] = useState([]);
    let [isUploaded, setUploaded] = useState(false);
    /*The decision to use React Hooks was strongly influenced by Brad Traversy in this 
    video:https://github.com/bradtraversy/react_file_uploader,
        https://www.youtube.com/watch?v=b6Oe2puTdMQ  */
   // These sites were helpful for CanvasJSChart documentation: https://canvasjs.com/react-charts/scatter-point-chart/ and https://canvasjs.com/react-charts/column-line-area-chart/.
    let specs;
    const handleChangeA = (e) => {
        setFile(e.target.files[0]);
    }

    const handleChange = (e) => {
        setFile2(e.target.files[0]);
    }
    //These functions create file objects based on user-uploaded files.
    const handleSubmit1 = (e) => {
        e.preventDefault();
        e.stopPropagation();
        Papa.parse(file, {complete: function(data) {
            setInputs(data.data);
        /*Papa Parse was installed and used with the assistance of https://www.npmjs.com/package/papaparse,
        https://www.papaparse.com/docs, and https://www.papaparse.com/ */
        }});
        setUploaded(true);
    }

    const handleSubmit2 = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        Papa.parse(file2, {complete: function(data) {setData(data.data);}});
    }
    /*These functions read a file into an array of arrays. These arrays will be manipulated later.
    handleSubmit1 creates an array for inputs and indicates that a file has been uploaded.
    handleSubmit2 (likely unnecessary after testing) creates an 
    array for model training. */

    const handleResponse = (e) => {
        setResponse(e.target.value);
    } //This function sets a response value (for model training).

    const handleChange1 = (e) => {
        let calls = [setInput1, setInput2, setInput3, setInput4, setInput5, setInput6, setInput7, setInput8, setInput9, setInput10];
        for (let i = 0; i < 10; ++i) {
            if (e.target.id === `e${i+1}`) {
              calls[i](e.target.value);
            }
        }
    } //This function allows the user to enter content into the inputs. 

    let batch;
    const handlePredict = () => {
        let fileInput = []; //This will contain the elements of a user-uploaded input file. 
        let indexes = []; //This array will contain the position of non-zero columns in the input file.
        if (isUploaded === true) {
            for (let i = 1; i < myInputs.length; ++i) { //Just take the numbers from the file, not the variable names.
                fileInput[i-1] = [];
                for (let j = 0; j < myInputs[0].length; ++j) {
                    fileInput[i-1][j] = parseFloat(myInputs[i][j]);
                }
            }
        } //Here the array of arrays coming from the file uploaded is modified so that the numbers are no longer strings.
        let y = 0;
        let inputList = [input1, input2, input3, input4, input5, input6, input7, input8, input9, input10];
        if (isUploaded === false) {
            for (let i = 0; i < inputList.length; ++i) {
                if (parseFloat(inputList[i]) !== 0) {
                    ++y;
                }
            }
        } else {
            for (let j = 0; j < myInputs[0].length; ++j) {
                for (let i = 0; i < fileInput.length; ++i) {
                    if (fileInput[i][j] !== 0) {
                        ++y;
                        indexes.push(j); //If a column is non-zero, put it in the array. 
                        break;
                    }
                    /*This nested loop runs through a given index of each array in fileInput until or unless
                    a non-zero entry is found. If such an entry is found, y is incremented and the loop moves on to another index. This
                    is equivalent to checking if a variable's inputs are all zero. */
                }
            }
        } //The above two statements count (based on whether there is a file upload) the predictors for which not all entries are 0.
        let datapts = [];
        for (let i = 1; i < myData.length; ++i) {
            /*Here a datapts array of objects is created for further ease in data-manipulation.
            These lines of code convert myData's non-variable-name contents into numbers and make 
            datapts from that modified array.*/

            datapts[i-1] = {};
            let notNumber = false;
            for (let j = 0; j < myData[0].length; ++j) {
                myData[i][j] = parseFloat(myData[i][j]);
                if (isNaN(myData[i][j]) === true) {
                    notNumber = true;
                    break; //Interrupt the conversion from string to float. This help came from https://www.w3schools.com/js/js_break.asp.
                }
            }
            if (notNumber === true) {
                myData.splice(i, 1); //Get rid of the line with the non-number entry.
                for (let j = 0; j < myData[0].length; ++j) { //Continue the interrupted conversion from string to float.
                    myData[i][j] = parseFloat(myData[i][j]);
                }
            }
            for (let j = 0; j < myData[0].length; ++j) {
                datapts[i-1][myData[0][j]] = myData[i][j];
            }
        }
        let dataX = [];
        let dataY = [];
        //Here arrays are made for model training. 
        for (let i = 0; i < datapts.length; ++i) {
            dataX[i] = [];
            dataY[i] = [];
            if (isUploaded === false) {
                for (let j = 0; j < myPred.length; ++j){
                    if (parseFloat(inputList[j]) !== 0) {
                        dataX[i].push(parseFloat(datapts[i][myPred[j]]));
                    }
                } 
            } else {
                for (let k = 0; k < fileInput.length; ++k) {
                    let z = 0;
                    for (let j = 0; j < myInputs[0].length; ++j) {
                        if (fileInput[k][j] !== 0) {
                            dataX[i].push(parseFloat(datapts[i][myPred[j]]));
                            ++z;
                        }
                    }
                    if (z > 0) {
                        break;
                    }
                }
            }
            dataY[i].push(parseFloat(datapts[i][response]));    
        }
        let output = [];
        let model;
        //Different regression occurs based on the response variable.
        if (document.getElementById("reg_type").value === "Linear") {
            const regress = new MLR(dataX, dataY);
            if (isUploaded === false) {
                let inputs = [];
                for (let i = 0; i < inputList.length; ++i) {
                    if (parseFloat(inputList[i]) !== 0) {
                        inputs.push(parseFloat(inputList[i]));
                    }/*The comments under https://stackoverflow.com/questions/351409/how-to-append-something-to-an-array 
                    helped in implementing the above push method. */
                }
                output = regress.predict(inputs); //This site (https://www.npmjs.com/package/ml-regression-multivariate-linear) was helpful for multiple linear regression documentation.
                batch = output[0];
                let datapts2 = [];
                let datapts3 = [];
                let xLabel;
                for (let i = 0; i < datapts.length; ++i) {
                    datapts2[i] = {};
                    datapts3[i] = {};
                    for (let j = 0; j < myPred.length; ++j) {
                        if ((y === 1) && (parseFloat(inputList[j]) !== 0)) {
                            xLabel = myPred[j];
                            datapts2[i].x = datapts[i][myPred[j]];
                            datapts3[i].x = datapts[i][myPred[j]];
                            datapts2[i].y = datapts[i][response];
                            model = regress.predict([datapts3[i].x]);
                            datapts3[i].y = model[0];
                        }
                    }//Here the data is put into objects to be graphed if there is only one predictor (all other predictors have only zeroes as values).
                }
                specs = {
                    zoomEnabled: true,
                    axisX: {title: xLabel},
                    axisY: {title: response}, 
                    legend: {verticalAlign: "top"},
                    markerColor: 'blue',
                    data: [{type: "scatter", name: "Actual", showInLegend: true, markersize: 1, 
                    markerColor: 'blue', dataPoints: 
                datapts2}, {type: "line", name: "Predicted", showInLegend: true, markersize: 30, dataPoints: datapts3}]
                //This is information for the graph. See above for CanvasJSChart documentation.
                };
            } else {
                let filePredict = [];
                for (let i = 0; i < fileInput.length; ++i) {
                    filePredict[i] = [];
                    for (let j = 0; j < indexes.length; ++j) {
                        filePredict[i].push(fileInput[i][indexes[j]]);
                    }
                } /*If a variable in the input file has only zeroes, then that variable will not be 
                included in the model prediction. */
                for (let i = 0; i < filePredict.length; ++i) {
                    let predict = regress.predict(filePredict[i]);
                    output.push(predict);
                }
                let map_key = 0;
                batch = output.map((i, ind) => (<div key = {map_key}><label key = {++map_key} > {map_key}: {i} </label></div>));
                /* This map displays the batch prediction along with numbers that identify the predictions from the input
                file (1st set of inputs, etc.). The website https://upmostly.com/tutorials/how-to-for-loop-in-react-with-examples 
                was helpful in creating the above loop. */
                let datapts2 = [];
                let datapts3 = [];
                let xLabel;
                for (let i = 0; i < datapts.length; ++i) {
                    datapts2[i] = {};
                    datapts3[i] = {};
                    for (let k = 0; k < fileInput.length; ++k) {
                        let z = 0;
                        for (let j = 0; j < myInputs[0].length; ++j) {
                            if ((fileInput[k][j] !== 0) && (y === 1)) {
                                xLabel = myPred[j];
                                datapts2[i].x = datapts[i][myPred[j]];
                                datapts3[i].x = datapts[i][myPred[j]];
                                datapts2[i].y = datapts[i][response];
                                model = regress.predict([datapts3[i].x]);
                                datapts3[i].y = model[0];
                            }
                        }
                        if (z > 0) {
                            break;
                        }
                    }
                } 
                specs = {
                    zoomEnabled: true,
                    axisX: {title: xLabel},
                    axisY: {title: response}, 
                    legend: {verticalAlign: "top"},
                    markerColor: 'blue',
                    data: [{type: "scatter", name: "Actual", showInLegend: true, markersize: 1, 
                    markerColor: 'blue', dataPoints: 
                datapts2}, {type: "line", name: "Predicted", showInLegend: true, markersize: 30, dataPoints: datapts3}]
                }; //This is information for the graph.
            }
            if (y === 1) {
                setGraph(<CanvasJSChart options = {specs}/>);
            } else {
                setGraph();
            }
        } // If there's only one predictor, display the graph.

        if (document.getElementById("reg_type").value === "Logistic") {
            setGraph(); //There is no graphing for this regression.
            const dataX1 = new Matrix(dataX);
            let data_Y = [];
            for (let i = 0; i < dataY.length; ++i) {
                data_Y[i] = dataY[i];
            } /*This logistic regression code is based on information from https://github.com/mljs/logistic-regression
            and https://www.npmjs.com/package/ml-logistic-regression. */
            const dataY1 = new Matrix(data_Y);
            const logist = new logistic({numSteps: 500, learningRate: 6e-3});
            logist.train(dataX1, dataY1);
            //Here the data is gathered and the model is trained.
            if (isUploaded === false) {
                let inputs = [];
                for (let i = 0; i < inputList.length; ++i) {
                    if (parseFloat(inputList[i]) !== 0) {
                        inputs.push(parseFloat(inputList[i]));
                    }/*The comments under https://stackoverflow.com/questions/351409/how-to-append-something-to-an-array 
                    helped in implementing the above push method. */
                }
                let final_inputs = new Matrix([inputs]);
                output = logist.predict(final_inputs);
                batch = output[0];
            } else {
                let filePredict = [];
                for (let i = 0; i < fileInput.length; ++i) {
                    filePredict[i] = [];
                    for (let j = 0; j < indexes.length; ++j) {
                        filePredict[i].push(fileInput[i][indexes[j]]);
                    }
                }
                let fileInput1 = new Matrix(filePredict);
                output = logist.predict(fileInput1);
                let map_key = 0;
                batch = output.map((i, ind) => (<div key = {map_key}><label key = {++map_key} > {map_key}: {i} </label></div>));
                //The website https://upmostly.com/tutorials/how-to-for-loop-in-react-with-examples was helpful in creating the above loop.
            } //Predictions are made based on whether the file input is used. 
        }
        setPrediction(batch);
        
    }


    const Load = (e) => {
        let myVars = [];
        let x = 0;
        for (let i = 0; i < myData[0].length; ++i) {
            if ((response !== myData[0][i]) && (x === 0)) {
                myVars[i] = myData[0][i];
            } else if ((response !== myData[0][i]) && (x === 1)) {
                myVars[i-1] = myData[0][i];
            } else if (response === myData[0][i]) {
                ++x;
            }
        }
        setPred(myVars);
        let names = [setInputName1, setInputName2, setInputName3, setInputName4, setInputName5, setInputName6, setInputName7, setInputName8, setInputName9, setInputName10];
        for (let i = 0; i < myVars.length; ++i) {
            names[i](myVars[i]);
        }
    } //This changes the relevant input names to the corresponding variable names. 

    /* To add the model-training file selection (1) and the modeling specifications (2), look below the return 
    statement. (1) goes after the <form> with event-handler handleSubmit1. (2) goes right above the current <ul> in <div id = "third">. 
    You can put (3) the leftover inputs below the other inputs in the return statement. */

    return(
        <React.Fragment>
            <div id = "first">
                <h1> Kizuna Tech </h1>
            </div>
            <div id = "second"/>
            <div style = {{paddingTop: "10px"}}/>
            <form onSubmit = {handleSubmit1}>
                <label htmlFor = "fileSelection"> Select an input file. </label>
                <input type = "file"  onChange = {handleChangeA}/>
                <button> Submit </button>
            </form>
        <div style = {{paddingTop: "15px"}}>
            <div id = "third">
                <div>
                    <ul>
                        <li><label> {inputName1} </label> 
                        <input id = "e1" type = "text" value = {input1} onChange = {handleChange1}/></li>
                        <li><label> {inputName2} </label> 
                        <input id = "e2" type = "text" value = {input2} onChange = {handleChange1}/></li>
                        <li><label> {inputName3} </label> 
                        <input id = "e3" type = "text" value = {input3} onChange = {handleChange1}/></li>
                        <li><label> {inputName4} </label> 
                        <input id = "e4" type = "text" value = {input4} onChange = {handleChange1}/></li>
                        <li><label> {inputName5} </label> 
                        <input id = "e5" type = "text" value = {input5} onChange = {handleChange1}/></li>
                        <li><label> {inputName6} </label> 
                        <input id = "e6" type = "text" value = {input6} onChange = {handleChange1}/></li>
                        <li> <button onClick = {handlePredict}> Predict </button></li>
                        <li> Prediction(s): {prediction} </li>
                    </ul>
                </div>
                {graph}
            </div>
        </div>
        </React.Fragment>
    ) 
}
/*
(1) let leftover_file_selection = <form onSubmit = {handleSubmit2}>
                <label htmlFor = "fileSelection"> Select file. </label>
                <input type = "file"  onChange = {handleChange}/>
                <button> Submit </button>
            </form>;

(2) let leftover_specifications (= <ul>
                        <li><label> Choose a response variable. </label>
                        <input id = "response" value = {response} onChange = {handleResponse}/>
                        <button id = "Done" onClick = {Load}> Done </button></li>
                        <li><label> Choose regression type </label>
                        <select id = "reg_type" > 
                            <option value = "Linear"> Linear </option>
                            <option value = "Logistic"> Logistic </option>
                        </select></li>
                    </ul>;

(3) let leftover_inputs = <li><label> {inputName7}</label> 
<input id = "e7" type = "text" value = {input7} onChange = {handleChange1}/></li>
<li><label> {inputName8} </label> 
<input id = "e8" type = "text" value = {input8} onChange = {handleChange1}/></li>
<li><label> {inputName9} </label> 
<input id = "e9" type = "text" value = {input9} onChange = {handleChange1}/></li>
<li><label> {inputName10} </label> 
<input id = "e10" type = "text" value = {input10} onChange = {handleChange1}/></li>
<li> <button onClick = {handlePredict}> Predict </button></li>


These are parts that will be kept for record but are not likely to be used in the final app version. */

export default FileData;

/*
Additional References: Here are many helpful references not mentioned above:
https://www.npmjs.com/package/ml-logistic-regression
https://www.npmjs.com/package/ml-regression-multivariate-linear
https://canvasjs.com/react-charts/scatter-point-chart/
https://reactjs.org/docs/jsx-in-depth.html#user-defined-components-must-be-capitalized
https://reactjs.org/tutorial/tutorial.html
https://reactjs.org/docs/getting-started.html#learn-react
https://reactjs.org/docs/introducing-jsx.html
https://www.w3schools.com/html/html_elements.asp
https://javascriptrefined.io/nan-and-typeof-36cd6e2a4e43
https://www.w3schools.com/cssref/css_colors_legal.asp
https://www.w3schools.com/js/tryit.asp?filename=tryjs_object_display_properties_all
https://www.w3schools.com/cssref/css_colors_legal.asp
https://www.w3schools.com/cssref/tryit.asp?filename=trycss3_align-content
https://www.w3schools.com/cssref/css3_pr_align-content.asp
https://github.com/mljs/logistic-regression
https://www.w3schools.com/JSREF/prop_select_value.asp
https://www.w3schools.com/js/js_break.asp
https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_select
https://www.w3schools.com/tags/tag_select.asp
https://javascriptrefined.io/nan-and-typeof-36cd6e2a4e43
https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation
https://reactjs.org/docs/handling-events.html
https://alligator.io/nodejs/how-to-use__dirname/#:~:text=js%3F,containing%20the%20currently%20executing%20file.&text=If%20you%20noticed%2C%20__dirname,cwd()%20(another%20popular%20Node.
https://transform.tools/html-to-jsx
https://www.w3schools.com/css/css_howto.asp
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
https://github.com/facebook/react/issues/6241
https://til.hashrocket.com/posts/dvqhfc5r0y-read-only-input-elements-with-react
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseFloat
https://reactjs.org/docs/conditional-rendering.html
https://reactjs.org/docs/fragments.html
https://reactjs.org/docs/faq-styling.html
*/
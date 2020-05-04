let snareNoise;
let canv;
let synth3Pat;
let autoFilter = false;
let env;
let env2;
let env3;
let snPat;
let song;
let synth;
let rev;
let delay;
let distortion;
let startStop;
let selectedScale;
let currentWave;
let recordButton;
let stopButton;
let playButton;
let sqCount = 0;
let recOn=false;
//spacer variable for positioning steps
let space = 20;
let space2 = 20;
let space3 = 20;
//scale variable
let major = true;
let notes = [
  "c",
  "c#/db",
  "d",
  "d#/eb",
  "e",
  "f",
  "f#/gb",
  "g",
  "g#/ab",
  "a",
  "a#/bb",
  "b",
];
//frequencies of ocatves in key of c
let c_major_2nd_oct = [65.41, 73.42, 82.41, 87.31, 98.0, 110.0, 123.47];
let c_major_4th_oct = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88];
let c_major_5th_oct = [523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77];
let c_minor_2nd_oct = [65.41, 73.42, 77.78, 87.31, 98, 103.83, 123.47];
let c_minor_4th_oct = [261.63, 293.66, 311.13, 349.23, 392, 415.3, 493.88];
let c_minor_5th_oct = [523.25, 587.33, 622.25, 698.46, 783.99, 830.61, 987.77];

//function that transposes frequencies of notes in a scale to other scales 
function transpose(notes, desiredScale, c_scale) {
  //Freq =note *  2 ^^N/12, where N is the number of intervals between note and desired note can be either positive or negative
  var intervals = 0;
  var transposed_scale = [];
  for (let i = 0; i < notes.length; i++) {
    //work out how many intervals
    if (desiredScale != notes[i]) {
      intervals += 1;
      console.log(intervals);
    } else {
      break;
    }
  }
  for (let i = 0; i < c_scale.length; i++) {
    // calculate new freq and push to list
    const new_freq = parseFloat((c_scale[i] * (2 ** (intervals / 12))).toFixed(2), 10);
    transposed_scale.push(new_freq);
  }
  console.log(transposed_scale);
  return transposed_scale;
}

//reference 
let octave = {
  c: 65.41,
  c_sharp: 69.3,
  d: 73.42,
  d_sharp: 77.78,
  e: 82.41,
  f: 87.31,
  f_sharp: 92.5,
  g: 98.0,
  g_sharp: 103.83,
  a: 110.0,
  a_sharp: 116.54,
  b: 123.47,
};
let ampAttack = 0;
let freqAttack = 0;
function setup() {
  getAudioContext();
  //initialise patterns/oscillators/modulators/fx
  synth2Pat = [0, 0, 0, 0, 0, 0, 0, 0];
  synthPat = [0, 0, 0, 0, 0, 0, 0, 0];
  synth3Pat = [0, 0, 0, 0, 0, 0, 0, 0];
  synthNoise = new p5.Oscillator();
  synthNoise.setType("square");
  synth2 = new p5.Oscillator();
  synth3 = new p5.Oscillator();
  synth3.setType("square");
  synth2.setType("square");
  lpFilter = new p5.LowPass();
  rev = new p5.Reverb();
  synthNoise.start();
  synthNoise.disconnect();
  synth2.start();
  synth2.disconnect();
  synth2.connect(lpFilter);
  synth3.start();
  synth3.disconnect();
  synth3.connect(lpFilter);
  synthNoise.connect(lpFilter);
  lpFilter.connect(rev);
  lpFilter.connect(env2);
  lpFilter.freq(22050);
  env2 = new p5.Envelope();
  env = new p5.Envelope();
  env3 = new p5.Envelope();
  synthNoise.amp(env2);
  synth2.amp(env);
  synth3.amp(env3);
  recorder = new p5.SoundRecorder();
  soundFile = new p5.SoundFile();
  let masterGain = new p5.Gain();
  masterGain.connect();
  
//add phrases
  song = new p5.Part();
  song.addPhrase(
    "synth 3",
    (time) => {
      env3.set(ampAttack, 0.5, 0.03, 0.1);
      env3.play(synth3, time, 0);
    },
    synth3Pat
  );
  song.addPhrase(
    "synth 2",
    (time) => {
      env.set(ampAttack, 0.5, 0.03, 0.1);
      env.play(synth2, time, 0);
    },
    synth2Pat
  );
  song.addPhrase(
    "synth drum",
    (time) => {
      env2.set(ampAttack, 0.5, 0.03, 0.05);
      env2.play(synthNoise, time, 0);
    },
    synthPat
  );
    //record function
  recordButton = createButton('Record');
  recordButton.position(645, 555);
  recordButton.mousePressed(recordFunc);
  stopButton = createButton('Stop');
  stopButton.position(695, 520);
  stopButton.mousePressed(stopRec);
  playButton = createButton('Play');
  playButton.position(645, 520);
  playButton.mousePressed(playRec);
  userStartAudio();
function recordFunc(){
  recOn = true;
  recorder.record(soundFile);
}
function stopRec(){
  recOn = false;
  soundFile.stop();
  recorder.stop();
  save(soundFile, 'mySound.wav');
  
}
function playRec(){
  soundFile.play();
}
// various sliders and buttons for interface
  bpmCTRL = createSlider(30, 1000, 90, 1);
  sliderName = "Speed";
  bpmCTRL.position(445, 450);
  bpmCTRL.input(() => {
    song.setBPM(bpmCTRL.value());
  });
  song.setBPM(90);

  volCntrl = createSlider(0, 1, 0.5, 0.1); 
  volCntrl.position(40, 450);
  volCntrl.input(() => {
    masterVolume(volCntrl.value());
  });


  freqCTRL = createSlider(0, 1, 0.01, 0);
  sliderName = "Attack";
  freqCTRL.position(240, 450);
  freqCTRL.input(() => {
    ampAttack = freqCTRL.value();
    console.log(freqAttack);
  });

  filterCutoffCTRL = createSlider(0, 22050, 1, 1);
  sliderName = "FILTER_CUTOFF";
  filterCutoffCTRL.style("background-color", "black");
  filterCutoffCTRL.position(40, 550);
  filterCutoffCTRL.input(() => {
    lpFilter.freq(filterCutoffCTRL.value());
  });

  filterResCTRL = createSlider(0, 30, 1, 1);
  sliderName = "FILTER_Resonance";
  filterResCTRL.position(240, 550);
  filterResCTRL.input(() => {
    lpFilter.res(filterResCTRL.value());
  });
  song.setBPM(120);

  revCTRL = createSlider(0, 1, 0.1, 0.1);
  sliderName = "Reverb";
  revCTRL.position(445, 550);
  revCTRL.input(() => {
    rev.amp(revCTRL.value());
  });
  startStop = createCheckbox(" Start/stop..................", false);
  startStop.changed(() => {
    if (startStop.checked()) {
      song.loop();
    } else {
      song.stop();
    }
  });
  startStop.position(30, 150);

  let autoFilterSwitch = createCheckbox("", false);
  autoFilterSwitch.position(30, 385);
  autoFilterSwitch.changed(() => {
    if (autoFilterSwitch.checked()) {
      autoFilter = true;
    } else {
      autoFilter = false;
    }
  });

  let majorMinorSwitch = createCheckbox("Major/minor", true);
  majorMinorSwitch.position(30, 355);
  majorMinorSwitch.changed(() => {
    if (majorMinorSwitch.checked()) {
      major = true;
    } else {
      major = false;
    }
  });
  let scale = createSelect("Scale");
  for(let i=0; i < notes.length; i++){
    scale.option(notes[i]);
  }
  scale.changed(scaleSelect);
  scale.position(400, 350);

 function scaleSelect(){
    selectedScale = scale.value();
    console.log(selectedScale);
  }
  let wave = createSelect("Wave");
  wave.option('square');
  wave.option('sine');
  wave.option('triangle');
  wave.changed(waveSelect);
  wave.position(400, 385);
  function waveSelect(){
    currentWave = wave.value();
  }  
//create checkboxes for steps
  let steps = [];
  for (let i = 1; i < synthPat.length + 1; i++) {
    let step = createCheckbox(` ${i}`, false);
    step.position(10 + space, 200);
    space += 60;
    step.changed(updateSynthPat);
    steps.push(step);
  }
  let steps2 = [];
  for (let i = 1; i < synth2Pat.length + 1; i++) {
    let step2 = createCheckbox(` ${i}`, false);
    step2.position(10 + space2, 250);
    space2 += 60;
    step2.changed(updateSynth2Pat);
    steps2.push(step2);
  }
  let steps3 = [];
  for (let i = 1; i < synth3Pat.length + 1; i++) {
    let step3 = createCheckbox(` ${i}`, false);
    step3.position(10 + space3, 300);
    space3 += 60;
    step3.changed(updateSynth3Pat);
    steps3.push(step3);
  }
  //function to update steps in pattern if checked
  function updateSynthPat() {
    for (let i = 0; i < steps.length; i++) {
      synthPat[i] = steps[i].checked() ? 1 : 0;
    }
  }
  function updateSynth2Pat() {
    for (let i = 0; i < steps2.length; i++) {
      synth2Pat[i] = steps2[i].checked() ? 1 : 0;
    }
  }
  function updateSynth3Pat() {
    for (let i = 0; i < steps3.length; i++) {
      synth3Pat[i] = steps3[i].checked() ? 1 : 0;
    }
  }
}

//draw text and display 
function draw() {

  textFont(myFont);
  frameRate(1);
  createCanvas(800, 610);
  background("black");
  noFill();
  stroke('white');
  strokeWeight(0.5);
  rect(460, 15, 110, 100);
  rect(600, 15, 180, 400);
  textSize(80);
  fill(76, 187, 23, 45);
  text("RMG-1", 40, 120);
  fill(76, 187, 23, 65);
  text("RMG-1", 35, 110);
  fill(76, 187, 23);
  text("RMG-1", 30, 100);
  strokeWeight(0.2);
  stroke("white");
  if (sqCount <= 10){
    fill(76, 187, 23, 25);
    rect(460, 15, 11*sqCount, 10*sqCount);
    sqCount +=1;
  }
  else{
    sqCount = 1;
  }
  if (sqCount <= 10){
    fill(76, 187, 23, 25);
    rect(460, 15, 6*sqCount, 5*sqCount);
    sqCount +=1;
  }
  else{
    sqCount = 1;
  }
  if (sqCount <= 10){
    fill(76, 187, 23, 25);
    rect(460, 15, 3*sqCount, 2*sqCount);
    sqCount +=1;
  }
  else{
    sqCount = 1;
  }
  fill(76, 187, 23);
  textSize(12);
  text("Speed", 445, 490);
  text("Float", 240, 490);
  text("Filter", 40, 590);
  text("Resonance", 240, 590);
  text("Reverb", 445, 590);
  text("Auto-filter", 50, 400);
  text("Volume", 40, 490);
  text("Scale", 300, 370);
  text("Waveform", 300, 400);
  textSize(10);
  fill(76, 187, 23);
  text("Random", 470, 50);
  text("Melody", 470, 70);
  text("Generator", 470, 90);
  textSize(9);
  text("Instructions..", 615, 35);
  text("Step 1 -", 615, 65);
  text("Tick some boxes\nin the lanes,each\nlane represents \na synth part.", 615, 95);
  text("Step 2 -", 615, 155);
  text("Choose a scale\nand a root note.\nchoose a waveform,\neach waveform\nhas its own sound.", 615, 185);
  text("Step 3 -", 615, 260);
  text("Play around with\nthe settings and\nget a melody\nyou like.", 615, 290);
  text("Step 4 -", 615, 350);
  text("Go crazy and\nhave fun!", 615, 380);
  text("Record your sequences\nhere to listen back.", 600, 500)



//switch between major and melodic minor scale and randomly select notes fom scale, uses the transpose function and var from scale dropdown
  if (major == true) {
    var randomNoteMaj =
      
    transpose(notes, selectedScale, c_major_2nd_oct)[Math.floor(Math.random() * transpose(notes, selectedScale, c_major_2nd_oct).length)];
    var randomNote2Maj =
    transpose(notes, selectedScale, c_major_4th_oct)[Math.floor(Math.random() * transpose(notes, selectedScale, c_major_2nd_oct).length)];
    var randomNote3Maj =
    transpose(notes, selectedScale, c_major_5th_oct)[Math.floor(Math.random() *transpose(notes, selectedScale, c_major_5th_oct).length)];
    synthNoise.freq(randomNoteMaj);
    synth2.freq(randomNote2Maj);
    synth3.freq(randomNote3Maj);
  }
  if (major == false) {
    var randomNoteMin =
    transpose(notes, selectedScale, c_minor_2nd_oct)[Math.floor(Math.random() * transpose(notes, selectedScale, c_minor_2nd_oct).length)];
    var randomNote2Min =
    transpose(notes, selectedScale, c_minor_4th_oct)[Math.floor(Math.random() * transpose(notes, selectedScale, c_minor_4th_oct).length)];
    var randomNote3Min =
    transpose(notes, selectedScale, c_minor_5th_oct)[Math.floor(Math.random() * transpose(notes, selectedScale, c_major_5th_oct).length)];
    synthNoise.freq(randomNoteMin);
    synth2.freq(randomNote2Min);
    synth3.freq(randomNote3Min);
  }
  
  synthNoise.setType(currentWave);
  synth3.setType(currentWave);
  synth2.setType(currentWave);
  if(recOn == true){
    fill('red');
    ellipse(725, 565, 20);
    
  }
  else{
    fill(76, 187, 23);
  }
    
//auto filter effect
  if (autoFilter == true) {
    lpFilter.freq(random(200, 22000));
  }

//Pixel effect on screen
  for (i = 0; i < 50; i++) {
    
    square(random(width), random(height), 1, 2);
  }
}
//load font
function preload() {
  myFont = loadFont("assets/PressStart2P-Regular.ttf");
}
//make sure synth plays on startup
function touchStarted() {
  getAudioContext().resume();
}

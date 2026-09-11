importScripts('game-rules.js','game-engine.js','learning-ai.js');
self.onmessage=event=>{
  const {id,policy,seeds,horizon}=event.data||{};
  try{
    const trials=seeds.map(seed=>self.BuildingLearningAI.simulate(policy,seed,horizon));
    self.postMessage({id,trials});
  }catch(error){
    self.postMessage({id,error:String(error?.stack||error)});
  }
};

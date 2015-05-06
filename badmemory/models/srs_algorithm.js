//SRS Engine that calculates when the sentence should be
//this should be run right after a user views a sentence and 
//checks the difficulty

//eg after the view, viewCount is incremented by one
//you just need to pass the value into the function, and the value is updated
//after the function execution

//after the execution of this function. 
//new ef, interval, and viewCount should be stored back into the db



/*
    Inputs
        difficulty: 4 is the median, range is 2<= difficulty <= 6
        EF: Old easiness factor
    
    Outputs
        Interval: how many days the later the user should view it again
        EF: new easiness factor
        
*/
module.exports = function (difficulty, EF, Interval, viewCount)
{
    if (viewCount == 0) //EF remains 2.5
    {
        Interval = 1; 
        viewCount++;
    }
    else if (viewCount == 1) //EF remains 2.5
    {
        viewCount++;
        Interval = 6;
    }
    else //new EF
    {
        viewCount++;
        
        EF = EF - 0.8 + 0.28 * difficulty - 0.02 * difficulty * difficulty;
        Interval = Interval * EF;
    }
    
    
}
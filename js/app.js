var timer = 0;
var active_solution = -1;
var valid_lapse = new Array();
var persona1Schedule  = new Schedule("Clément Mihailescu",5,50,1200,100,[],[]);
var persona2Schedule  = new Schedule("Alfredo Galano Loyola",5,250,1200,100,[],[]);
var mergedSchedule  = new Schedule("Merged",5,200,1200,50,valid_lapse,[]);
var time_after_draw = 0;

var duration = document.getElementById("select-duration").value;

function updateDuration() {
  duration = document.getElementById("select-duration").value;
}

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.canvas.width  = 1300;
ctx.canvas.height = 480;

var button = document.getElementById('btn-download');
button.addEventListener('click', function (e) {
    var dataURL = c.toDataURL('image/png');
    button.href = dataURL;
});

function drawCursor(x,y,aWidth,aLength,color){
    var dx=0;
    var dy=40;
    var angle=Math.atan2(dy,dx);
    var length=Math.sqrt(dx*dx+dy*dy);
    //
    ctx.strokeStyle = color;
    ctx.translate(x,y-dy-3);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(length,0);

    ctx.moveTo(length-aLength,-aWidth);
    ctx.lineTo(length,0);
    ctx.lineTo(length-aLength,aWidth);
    //
    ctx.stroke();
    ctx.setTransform(1,0,0,1,0,0);
}
function cursorDelete(x,y) {
	ctx.fillStyle="#e9e9e9";
	ctx.fillRect(x-8, y-43, 16, 42);
}

function drawBox(x1,x2) {
	ctx.beginPath();
	ctx.fillStyle = "rgba(0,0,0,0.2)";
	ctx.fillRect(x1,persona1Schedule.startY, x2-x1, 350);
	ctx.stroke();
}

function stringHourToNumber(strHour) {
	var temp = strHour.split(":");
	var hour = parseInt(temp[0]) + parseInt(temp[1])/60; 
	return hour;
}

function TimeToInt(strHour) {
	var temp = strHour.split(":");
	var hour = parseInt(temp[0])*60 + parseInt(temp[1]); 
	return hour;
}

function IntToTime(number) {
	
	var hours = parseInt(number/60) ;
	var minutes = number%60;

	if (hours < 10) {
		hours ="0"+hours;
	}
	if (minutes == 0) {
		minutes ="00";
	}


	return hours+':'+minutes;
}

function scheduleToInterval(schedule) {
	for (var i = 0; i < schedule.length; i++) {
		schedule[i][0] = TimeToInt(schedule[i][0]);
        schedule[i][1] = TimeToInt(schedule[i][1]);
	}
}

function searchIntervalOnList(interval,list) {
	var is_in = 0;
	for (var i = 0; i < list.length; i++) {
		if (list[i][0] == interval[0] && list[i][1] == interval[1]){
			is_in = 1;
			break;
		}
		
	}
	return is_in;
}

function mergeIntervals(shedule) {
	var sortedArray = shedule.sort(function(a, b) { return a[0] - b[0];});
	temp_merged_list = [];
    new_start = -1;
    new_end = -1;
    for (var i = 0; i < sortedArray.length; i++){
    	
    	a = sortedArray[i];
    	if (a[0] > new_end){
    		if (i != 0){
    			temp_merged_list.push([new_start, new_end]);
    		}
    		new_end = a[1];
            new_start = a[0];


    	} else {
    		if (a[1] >= new_end) {
    			new_end = a[1];
    		}

    	}
    }
    if (new_end != 0 && searchIntervalOnList([new_start, new_end],temp_merged_list)==0) {
    	temp_merged_list.push([new_start, new_end]);
    }
    return temp_merged_list;

}


function incrementTimer(value) {
	timer = timer + value;
}

function validMeetDayLapse(Schedule1, Schedule2) {
    return [IntToTime(Math.max(TimeToInt(Schedule1.availableForMeet[0]),TimeToInt(Schedule2.availableForMeet[0]))),IntToTime(Math.min(TimeToInt(Schedule1.availableForMeet[1]),TimeToInt(Schedule2.availableForMeet[1])))];;	
}

function checkInterval(listValidMeet,end,start,duration) {
    if ((end - start) >= duration) {

		drawCursor(start/60*persona1Schedule.ScheduleWidth/24 + persona1Schedule.startX,50,5,8,"green");
		drawCursor(start/60*persona2Schedule.ScheduleWidth/24 + persona2Schedule.startX,300,5,8,"green");
		drawCursor(end/60*persona1Schedule.ScheduleWidth/24 + persona1Schedule.startX,50,5,8,"red"); 
		drawCursor(end/60*persona2Schedule.ScheduleWidth/24 + persona2Schedule.startX,300,5,8,"red");
    	persona1Schedule.drawMeetBlock(start/60,end/60);
	    persona2Schedule.drawMeetBlock(start/60,end/60);

	    listValidMeet.push([IntToTime(start),IntToTime(end)]);
	}
}
function checkMergedInterval(listValidMeet,end,start,duration) {
    if ((end - start) >= duration) {

		mergedSchedule.drawMeetBlock(start/60,end/60);
	    listValidMeet.push([IntToTime(start),IntToTime(end)]);
	}
}

function solved(listValidMeet) {
	var answers ="";
	var len = listValidMeet.length;
	for (var i = 0; i < len; i++) {
		answers = answers +"["+ listValidMeet[i]+"]";
		if(len > 1 && i < len-1 ){
			answers =  answers + ", ";
		}
	}
	active_solution = 0;
	Toastify({
		  text: "Done!"+"Answer: "+"["+answers+"]",
		  duration: 5000, 
		  gravity: "top", // `top` or `bottom`
		  close:true,
		  position: 'center', // `left`, `center` or `right`
		  backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
		  stopOnFocus: true // Prevents dismissing of toast on hover

	}).showToast();
}

function meetingPlanning1(duration) {
	let listValidMeet = new Array();
	let personsFreeTime = new Array();
    personsFreeTime = mergedSchedule.freeTime(duration);
    
    sleep(timer).then(() => { mergedSchedule.drawFreeTime(personsFreeTime); });
    for (let i = 0; i < personsFreeTime.length; i++) {
    		
    		incrementTimer(500);
			setTimeout(() => {  checkMergedInterval(listValidMeet,personsFreeTime[i][1],personsFreeTime[i][0],duration); }, timer);
			
    	
    }
    incrementTimer(500);
	setTimeout(() => {  solved(listValidMeet); }, timer);
    return listValidMeet;
}

function meetingPlanning2(duration) {
	let listValidMeet = new Array();
	let person1FreeTime = new Array();
	let person2FreeTime = new Array();
	person1FreeTime = persona1Schedule.freeTime(duration);
    person2FreeTime = persona2Schedule.freeTime(duration);

    sleep(timer).then(() => { persona1Schedule.drawFreeTime(person1FreeTime); });
	sleep(timer).then(() => { persona2Schedule.drawFreeTime(person2FreeTime); });

    for (let i = 0; i < person1FreeTime.length; i++) {
    	for (let j = 0; j < person2FreeTime.length; j++) {
    		let x1 = person1FreeTime[i][0];
    		let x2 = person2FreeTime[j][0];
    		let x11 = person1FreeTime[i][1];
    		let x21 = person2FreeTime[j][1];
            let start = Math.max(x1,x2);
            let end = Math.min(x11,x21);
			incrementTimer(500);
			setTimeout(() => {  drawCursor(x1/60*persona1Schedule.ScheduleWidth/24 + persona1Schedule.startX,50,5,8,"green"); }, timer);
			setTimeout(() => {  drawCursor(x2/60*persona2Schedule.ScheduleWidth/24 + persona2Schedule.startX,300,5,8,"green"); }, timer);
			setTimeout(() => {  drawCursor(x11/60*persona1Schedule.ScheduleWidth/24 + persona1Schedule.startX,50,5,8,"#f44336"); }, timer);
			setTimeout(() => {  drawCursor(x21/60*persona2Schedule.ScheduleWidth/24 + persona2Schedule.startX,300,5,8,"#f44336"); }, timer);

            incrementTimer(500);
			setTimeout(() => {  cursorDelete(x1/60*persona1Schedule.ScheduleWidth/24 + persona1Schedule.startX,50); }, timer);
			setTimeout(() => {  cursorDelete(x11/60*persona1Schedule.ScheduleWidth/24 + persona1Schedule.startX,50); }, timer);
			setTimeout(() => {  cursorDelete(x2/60*persona2Schedule.ScheduleWidth/24 + persona2Schedule.startX,300); }, timer);
			setTimeout(() => {  cursorDelete(x21/60*persona2Schedule.ScheduleWidth/24 + persona2Schedule.startX,300); }, timer);
			
			setTimeout(() => {  checkInterval(listValidMeet,end,start,duration); }, timer);
			incrementTimer(1500);
			setTimeout(() => {  cursorDelete(start/60*persona1Schedule.ScheduleWidth/24 + persona1Schedule.startX,50); }, timer);
			setTimeout(() => {  cursorDelete(end/60*persona1Schedule.ScheduleWidth/24 + persona1Schedule.startX,50); }, timer);
			setTimeout(() => {  cursorDelete(start/60*persona2Schedule.ScheduleWidth/24 + persona2Schedule.startX,300); }, timer);
			setTimeout(() => {  cursorDelete(end/60*persona2Schedule.ScheduleWidth/24 + persona2Schedule.startX,300); }, timer);
    	}
    }
    incrementTimer(500);
	setTimeout(() => {  solved(listValidMeet); }, timer);


    return listValidMeet;
}

function Schedule(owner,startX,startY,ScheduleWidth,ScheduleHeigth,availableForMeet,ScheduleDay) {
  this.owner = owner;
  this.startX = startX;
  this.startY = startY;
  this.ScheduleWidth = ScheduleWidth;
  this.ScheduleHeigth = ScheduleHeigth;
  this.availableForMeet = availableForMeet;
  this.ScheduleDay = ScheduleDay;
  this.freeTimeForMeet = new Array();
}

Schedule.prototype.initSchedule = function() {
  // Schedule for Person 1
	ctx.beginPath();
	ctx.lineWidth = "2";
	ctx.strokeStyle = "red";
	ctx.rect(this.startX, this.startY, this.ScheduleWidth, this.ScheduleHeigth);  
	ctx.stroke();

	for (var i = 0; i < 24; i++) {
		ctx.moveTo(i*this.ScheduleWidth/24 + this.startX, this.startY);
		ctx.lineTo(i*this.ScheduleWidth/24 + this.startX,this.ScheduleHeigth + this.startY);
		ctx.stroke();

		ctx.font = "16px Arial";
		ctx.fillStyle = "black";
		var hour ="";

		if (i < 12 ) {
			hour = i+"AM" 

		}
		else {
			if(i == 12 ) 
			{
				hour = i+"M" 

			}
			else{
				hour = i+"PM" 

			}
		}
		
		ctx.fillText(hour, i*this.ScheduleWidth/24 , this.ScheduleHeigth + this.startY + 16); 	
	}


};

Schedule.prototype.drawAvailableMeetTime = function() {
	var startTime = this.availableForMeet[0];
	var endTime = this.availableForMeet[1];
	if(!Number.isInteger(startTime)){
		startTime = stringHourToNumber(startTime);
	}
	if(!Number.isInteger(endTime)){
		endTime = stringHourToNumber(endTime);
	}

	
	ctx.fillStyle="rgba(91,199,246,0.5)";
	ctx.fillRect(startTime*this.ScheduleWidth/24 + this.startX, this.startY, (endTime-startTime)*this.ScheduleWidth/24, this.ScheduleHeigth); 

};

Schedule.prototype.drawValidAvailableMeetTime = function(lapse) {
	var startTime = stringHourToNumber(lapse[0]);
	var endTime = stringHourToNumber(lapse[1]);
	ctx.fillStyle="rgba(0,150,136,0.8)";
	ctx.fillRect(startTime*this.ScheduleWidth/24 + this.startX,this.ScheduleHeigth + this.startY, (endTime-startTime)*this.ScheduleWidth/24, 20); 

};



Schedule.prototype.drawScheduleBlock = function(iterator){
	var startTime = (this.ScheduleDay[iterator][0]/60);
	var endTime = (this.ScheduleDay[iterator][1]/60);
	ctx.fillStyle="#f44336";
	ctx.fillRect(startTime*this.ScheduleWidth/24 + this.startX, this.startY, (endTime-startTime)*this.ScheduleWidth/24, this.ScheduleHeigth);
	if (active_solution == 1 && timer >= time_after_draw+1500 ) {
			drawBox(startTime*this.ScheduleWidth/24 + this.startX, endTime*this.ScheduleWidth/24 + this.startX,);
	}
}

Schedule.prototype.drawMeetBlock = function(start,end){
	ctx.fillStyle="#4caf50";
	ctx.fillRect(start*this.ScheduleWidth/24 + this.startX, this.startY, (end-start)*this.ScheduleWidth/24, this.ScheduleHeigth);
}

Schedule.prototype.drawScheduleBusyTime = function() {
	for (let i = 0; i < this.ScheduleDay.length; i++) {
		incrementTimer(500);
		setTimeout(() => {  this.drawScheduleBlock(i); }, timer);
	}
};

Schedule.prototype.validFreeTime = function(end,start, duration, mylist){
	if ((start >= TimeToInt(valid_lapse[0]) && TimeToInt(valid_lapse[1]) >= end && end - start >= duration)){
        mylist.push([start,end]);
	}
	if ( TimeToInt(valid_lapse[0]) > start &&  end > TimeToInt(valid_lapse[0]) && end - TimeToInt(valid_lapse[0]) >= duration) {
		mylist.push([TimeToInt(valid_lapse[0]),end]);
	} 
	if ( TimeToInt(valid_lapse[1]) > start &&  end > TimeToInt(valid_lapse[1]) && TimeToInt(valid_lapse[1]) - start >= duration) {
		mylist.push([start,TimeToInt(valid_lapse[1])]);
	} 
};

Schedule.prototype.freeTime = function(meetDuration) {
	var personFreeTime = new Array();
	var i = 0;

    this.validFreeTime(this.ScheduleDay[i][0],TimeToInt(valid_lapse[0]),meetDuration,personFreeTime);
    for ( i = 0; i < this.ScheduleDay.length-1; i++) {
    	this.validFreeTime(this.ScheduleDay[i+1][0],this.ScheduleDay[i][1],meetDuration,personFreeTime);
    }
  
    this.validFreeTime(TimeToInt(valid_lapse[1]),this.ScheduleDay[i][1],meetDuration,personFreeTime);
    return personFreeTime;
	
};

Schedule.prototype.drawFreeTime = function(freeTime) {
	for ( let i = 0; i < freeTime.length; i++) {
	var startTime = freeTime[i][0]/60;
	var endTime = freeTime[i][1]/60;
	ctx.fillStyle="#ffe821";
	ctx.fillRect(startTime*this.ScheduleWidth/24 + this.startX, this.startY, (endTime-startTime)*this.ScheduleWidth/24, this.ScheduleHeigth);
    }

	
};

Schedule.prototype.reset = function() {

	ctx.fillStyle="#e9e9e9";
	ctx.fillRect(this.startX, this.startY, 24*this.ScheduleWidth/24, this.ScheduleHeigth); 
	this.initSchedule();
	
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function resetCanvas() {
	timer = 0;
	ctx.fillStyle = "#e9e9e9";
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	
}



function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function generatRandomLapse() {
	var start = getRndInteger(8, 12) * 60;
	var end = getRndInteger((start/60)+8, 20) * 60;
	return [IntToTime(start) ,IntToTime(end)];
}


function generatRandomSchedule(dailybound,duration) {
	var task = [];
	var task_counter = getRndInteger(4, 5);
	var start = getRndInteger(TimeToInt(dailybound[0])/60, TimeToInt(dailybound[0])/60 +2);
	var end = 8;
	for (var i = 0; i < task_counter; i++) {
		var task_duration = getRndInteger(1,5) * duration;
		var free_time = getRndInteger(0,5)* duration;
	
		if ( i > 0 && TimeToInt(task[i-1][1]) >= start*60) {

				start = TimeToInt(task[i-1][1])/60 + free_time/60;
				
					
		}
		end = start + task_duration/60;

		if (end >= TimeToInt(dailybound[1])/60) {
			end = TimeToInt(dailybound[1])/60;
		} 
		if (start < TimeToInt(dailybound[1])/60)  {
			task[i] = [IntToTime(start*60) ,IntToTime(end*60)];

		} 
		
	}


	return task;
}

function generateRandomData(duration) {
	if (active_solution < 1 ) {
		
		persona1Schedule  = new Schedule("Mark",5,50,1200,100,[],[]);
		persona2Schedule  = new Schedule("Alfredo",5,300,1200,100,[],[]);
		mergedSchedule  = new Schedule("Merged",5,200,1200,50,[],[]);

		persona1Schedule.availableForMeet  = generatRandomLapse();
		persona2Schedule.availableForMeet  = generatRandomLapse();

		persona1Schedule.ScheduleDay = generatRandomSchedule(persona1Schedule.availableForMeet,duration);
		persona2Schedule.ScheduleDay = generatRandomSchedule(persona2Schedule.availableForMeet,duration);

		scheduleToInterval(persona1Schedule.ScheduleDay);
		scheduleToInterval(persona2Schedule.ScheduleDay);

		active_solution = 0;
		resetCanvas();
		clearTimeout();

		Toastify({
		  text: "Data is Ready! Now you can use the solutions!!!",
		  duration: 3000, 
		  gravity: "top", // `top` or `bottom`
		  close:true,
		  position: 'center', // `left`, `center` or `right`
		  backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
		  stopOnFocus: true // Prevents dismissing of toast on hover

		}).showToast();


	}
}
function dataNotification() {
	Toastify({
	  text: "Please, check:<br> 1- You generated data first.<br> 2- If any of the Solution is running, you must wait it finish!!!.",
	  duration: 5000, 
	  close:true,
	  gravity: "bottom", // `top` or `bottom`
	  position: 'center', // `left`, `center` or `right`
	  backgroundColor: "linear-gradient(to right, #f44336, #ff0000)",
	  stopOnFocus: true // Prevents dismissing of toast on hover

	}).showToast();
}
function solution1(){
	if (active_solution == 0) {
		active_solution = 1;
		clearTimeout();
		resetCanvas();
		time_after_draw = (persona1Schedule.ScheduleDay.length + persona2Schedule.ScheduleDay.length-2)*500;
		valid_lapse = validMeetDayLapse(persona1Schedule,persona2Schedule);
		mergedSchedule.availableForMeet = valid_lapse;
		mergedSchedule.ScheduleDay = persona1Schedule.ScheduleDay;
		mergedSchedule.ScheduleDay = mergedSchedule.ScheduleDay.concat(persona2Schedule.ScheduleDay);
	
		mergedSchedule.ScheduleDay = mergeIntervals(mergedSchedule.ScheduleDay);
		
		persona1Schedule.initSchedule();
		persona2Schedule.initSchedule(); 
		sleep(1000).then(() => { persona1Schedule.drawAvailableMeetTime(); });
		sleep(1000).then(() => { persona2Schedule.drawAvailableMeetTime(); });
		sleep(1000).then(() => { persona1Schedule.drawScheduleBusyTime(); });
		sleep(1000).then(() => { persona2Schedule.drawScheduleBusyTime(); });
		
		sleep(time_after_draw+2500).then(() => { persona1Schedule.drawValidAvailableMeetTime(valid_lapse); });
		sleep(time_after_draw+2500).then(() => { persona2Schedule.drawValidAvailableMeetTime(valid_lapse); });
	   	sleep(time_after_draw+2500).then(() => { mergedSchedule.initSchedule();  });
	   	sleep(time_after_draw+2500).then(() => { mergedSchedule.drawScheduleBusyTime(); });
	   	sleep(time_after_draw+3000).then(() => { mergedSchedule.drawValidAvailableMeetTime(valid_lapse); });
		sleep(time_after_draw+3000).then(() => { mergedSchedule.drawAvailableMeetTime(); });
		sleep(time_after_draw+3000).then(() => { meetingPlanning1(duration); });
	}else{
		dataNotification();
	}

}

function solution2(){
	if (active_solution == 0) {
		active_solution = 2;
		clearTimeout();
		resetCanvas();

		time_after_draw = (persona1Schedule.ScheduleDay.length + persona2Schedule.ScheduleDay.length-2)*500;
		persona1Schedule.initSchedule();
		persona2Schedule.initSchedule(); 


		sleep(1000).then(() => { persona1Schedule.drawAvailableMeetTime(); });
		sleep(1000).then(() => { persona2Schedule.drawAvailableMeetTime(); });
		sleep(1000).then(() => { persona1Schedule.drawScheduleBusyTime(); });
		sleep(1000).then(() => { persona2Schedule.drawScheduleBusyTime(); });
		valid_lapse = validMeetDayLapse(persona1Schedule,persona2Schedule);
		sleep(time_after_draw+2500).then(() => { persona1Schedule.drawValidAvailableMeetTime(valid_lapse); });
		sleep(time_after_draw+2500).then(() => { persona2Schedule.drawValidAvailableMeetTime(valid_lapse); });
	   
		sleep(time_after_draw+3000).then(() => { meetingPlanning2(duration); });

	}else{
		dataNotification();
	}

	

}
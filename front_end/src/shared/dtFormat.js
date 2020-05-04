export function dtFormat(startTime) {
    let dateSlice = startTime.slice(0, 10);
  
    let gameDate = dateSlice =>{
      let year = dateSlice.slice(0, 4);
      let month = dateSlice.slice(5, 7);
      let day = dateSlice.slice(8, 10);
  
      return month + '/' + day + '/' + year;
    };
  
    let timeSlice = startTime.slice(11, 16);
  
    let gameTime = timeSlice => {
      let hour = timeSlice.slice(0,2);
      let min = timeSlice.slice(3,5);
      let section = 'AM';
  
      if (hour > 12){
        hour = hour - 12;
        section = 'PM';
      }
  
      return hour + ':' + min + ' ' + section;
    };
  
    return gameDate(dateSlice) + ' @ ' + gameTime(timeSlice);
}
  
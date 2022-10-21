  //GOAL: self populate assignment into "xxxx xx Availability"
  //1. Data tab "2019 Q4 Availability"
  //2. Read data < GS can handle
  //2.1 1 = unavailable ; empty = available
  //3. Put in schedule
  //3.1 Per group availability count least 0 days
  //3.2 Per Bonding count least 0 days
  //3.3 

var currentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("2019 Q4 Availability"); //<<<<<< edit the name to 20xx Qx Availability
var scrapSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ScrapSheet");
var dutyList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Duty");
var currentSheetStartRow = 3;
var currentSheetStartColumn = 4;
var currentSheetLastRow = currentSheet.getLastRow()-1;
var currentSheetLastColumn = currentSheet.getLastColumn()-6;

function findCurrentSheetLastRow(){

}

function scheduling() {
  scrapSheet.clear();
  countExistingGroup(currentSheet, scrapSheet);
  countGroupMemberAvailability(currentSheet, scrapSheet);
  pickPersonByGroup (currentSheet, scrapSheet);
  //countIndividuals(currentSheet, scrapSheet);
}

//find bonding (1+), check availability. (i.e. couples only one is availabe at that month), if same group assign the group; if no group, assign; if not same group, follow the one with most availablilty. > left no group, no bonding group, group leftovers

function findBondingAvailableDate(){

}

//group
//individuals


//this function finds individuals who needs to bond with someone, and who are they
//this function check if the bonded belongs to the same group





//This funciton finds individuals hasn't assigned
function countIndividuals(aSheet, sSheet){ 

  var name;
  var rowHolder;
  sSheet.clear();
  for (row = 3 ; row < currentSheetLastRow ; row++){
    if (columnHasBlank(row) == true){
      name = aSheet.getRange(row,2).getValue();
      if (sSheet.getRange(1,1).isBlank() == true){
        sSheet.getRange(1,1).setValue(name);
        for (colCounter = 4 ; colCounter < 14 ; colCounter++){
          if (aSheet.getRange(row, colCounter).isBlank() == true){
            sSheet.getRange(1,colCounter).setValue(1);
          }
        }
      }
      else{
        rowHolder = sSheet.getLastRow()+1;
        sSheet.getRange(rowHolder,1).setValue(name);
        for (colCounter = 4 ; colCounter < 14 ; colCounter++){
          if (aSheet.getRange(row, colCounter).isBlank() == true){
            sSheet.getRange(rowHolder,colCounter).setValue(1);
          }
        }
      }
    }
  }

}

function columnHasBlank (row){// reference from https://stackoverflow.com/questions/6882104/faster-way-to-find-the-first-empty-row-in-a-google-sheet-column

  var result = false;
  for (col = 4 ; col < currentSheetLastColumn ; col++){
    if (currentSheet.getRange(row,col).isBlank() == true){
      result = true;
    }
  }
  return result;
}


//This function assigns the availables to duties/position
  function assignDuty(duty, row, column){ // dutySheet, GUMerRow, maxColumn = day & srvice
    var postName = "";

    if (row > 8 ){

        for (k = 3 ; k <= duty.getLastRow(); k++){
          if (duty.getRange(k,column).getValue() == 0){
            postName = duty.getRange(k,1).getValue();
            break;
          }
        }

    }
    else if (row <=8 && duty.getRange(2,column).getValue() == 0) {

      postName = duty.getRange(2,1).getValue(); //this line will return Master regarless

    }

    else { 
      postName = "" ;
    }

  return postName;
  }

function postIsAvailable (column, post ){
  var result = true;
  var position = dutyList.createTextFinder(post).findAll();
  if (dutyList.getRange(position[0].getRow(),column).getValue()!= 0 ){
    result = false;
  }
return result;

}


//This function decides the person who should get assigned
 function pickPersonByGroup(aSheet, sSheet){

  var getMax;
  var findMaxCell;
  var maxRow;
  var maxCol;
  var availableGroup;
  var groupsInASheet;
  var row;
  var rangeA1;
  var post;
  var lowerCol;
  var upperCol;

  //set Max cell location and formula
  var sSheetLastRow = sSheet.getLastRow();
  var setRange = sSheet.getRange(1,4,sSheetLastRow,10).getA1Notation();
  sSheet.getRange(sSheetLastRow,14).setFormula("=MAX("+setRange+")");
  var maxA1 = sSheet.getRange(sSheetLastRow,14).getA1Notation();

  //assign by group
  while (sSheet.getRange(maxA1).getValue() > 1){

    getMax = sSheet.getRange(maxA1).getValue();
    findMaxCell = sSheet.createTextFinder(getMax).findAll();
    maxRow = findMaxCell[0].getRow();
    maxCol = findMaxCell[0].getColumn();
    availableGroup = sSheet.getRange(maxRow,1).getValue();
    groupsInASheet = aSheet.createTextFinder(availableGroup).findAll();

      for (j = 0 ; j < groupsInASheet.length ; j++){

          row = groupsInASheet[j].getRow();

            if (aSheet.getRange(row, maxCol).getValue() =="" ){
              
              //aSheet.getRange(row,maxCol).setValue("available"); //debug use
              post = assignDuty(dutyList, row,maxCol);
              aSheet.getRange(row,maxCol).setValue(post);
              if (maxCol%2 == 0 && aSheet.getRange(row, maxCol+1).isBlank() == true && post !=""&& postIsAvailable(maxCol+1,post)==true){
                aSheet.getRange(row, maxCol+1).setValue(post);
                lowerCol = maxCol;
                upperCol = maxCol +1 ; 
              }
              else if (maxCol%2 != 0 && aSheet.getRange(row, maxCol-1).isBlank() == true && post != "" && postIsAvailable(maxCol-1,post)==true){
                aSheet.getRange(row, maxCol-1).setValue(post);
                lowerCol = maxCol-1;
                upperCol = maxCol;
              }
              else {
                lowerCol = maxCol;
                upperCol = maxCol;
              }
              if (post != ""){
              //Below if statements to rule out assigned GUMers
              
                if (lowerCol == 4){ //TODO: need adjust
                  rangeA1 = aSheet.getRange(row, upperCol+1, 1, (13 - upperCol)).getA1Notation();
                  aSheet.getRange(rangeA1).setValue(1);
                  }
                  else if (lowerCol > 4 && upperCol <13){
                    rangeA1 = aSheet.getRange(row,4,1,(lowerCol-4)).getA1Notation()
                    aSheet.getRange(rangeA1).setValue(1);
                    rangeA1 = aSheet.getRange(row,upperCol+1,1,(13-upperCol)).getA1Notation();
                    aSheet.getRange(rangeA1).setValue(1);
                  }
                  else if (upperCol == 13){ 
                    rangeA1 = aSheet.getRange(row,4,1,(lowerCol-4)).getA1Notation();
                    aSheet.getRange(rangeA1).setValue(1);
                    }
                  else{ //impossible to have < 4 and >13
                    ;
                  }
                  
              }
              } // end of if (aSheet.getRange(row, maxCol).getValue() =="")

        }//end of for j
    var rangeRowA1 = sSheet.getRange(maxRow,4,1,10).getA1Notation();
    var rangeColumnA1 = sSheet.getRange(1, maxCol ,sSheetLastRow,1).getA1Notation();
    sSheet.getRange(rangeRowA1).setValue(0);
    sSheet.getRange(rangeColumnA1).setValue(0);



  } //end of while

}


//This function finds out available days by group
//interact with column 4-13 (5 weeks, 10 sessions)
function countGroupMemberAvailability(aSheet, sSheet){

  var aSheetLastRow = aSheet.getLastRow();

  for (i = 3 ; i < aSheetLastRow ; i++){
    var selectGroupName = aSheet.getRange(i,3).getValue();
    if (selectGroupName != "" && selectGroupName != "n/a"){
      for (j = 4; j < 14 ; j++){
        if (aSheet.getRange(i,j).getValue() == ""){
          var group = sSheet.createTextFinder(selectGroupName).findAll();
          var groupRow = group[0].getRow();
          var currentValue = sSheet.getRange(groupRow,j).getValue();
          sSheet.getRange(groupRow,j).setValue(currentValue+1);
          }
        }
      } // end of if selectGroupName != ""
    }//end of FOR
    


  }


//This function finds out all the existing group
function countExistingGroup(aSheet, scrapSheet){

  var lastRow = aSheet.getLastRow();
    for (i = 3 ; i < lastRow ; i++){
    var selectGroupName = aSheet.getRange(i,3).getValue();
    if (selectGroupName != "" && selectGroupName != "n/a"){

      var scrapSheetLastRow = scrapSheet.getLastRow();

      if (scrapSheetLastRow == 0){
        scrapSheet.getRange(1, 1).setValue(selectGroupName);

      }
      else{
          var getDuplicated = scrapSheet.createTextFinder(selectGroupName).findAll();
          if(getDuplicated.length == 0){
            scrapSheet.getRange(scrapSheetLastRow+1, 1).setValue(selectGroupName);

          }
          else{
              ;
          }
      }

    }
    else{
      ;
    }  
  }//end of FOR loop

  resetGroupAvailability(scrapSheet);  

}//end of function countExistingGroup

//This function set all group available days to 0
function resetGroupAvailability(scrapSheet){
    //initialize scrapsheet row 9-18, column 4-13
  var endIndexScrapSheet = scrapSheet.getLastRow();
  var rangeA1Notation = scrapSheet.getRange(1,4,endIndexScrapSheet,10).getA1Notation();
  scrapSheet.getRange(rangeA1Notation).setValue(0);
}


  //Logger.log("range="+selectGroupName);


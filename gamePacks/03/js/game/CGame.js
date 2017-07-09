function CGame(oData){
    var _bUpdate = false;
    var _iCurState;
    var _iCurReelLoops;
    var _iNextColToStop;
    var _iNumReelsStopped;
    var _iLastLineActive;
    var _iTimeElaps;
    var _iCurWinShown;
    var _iCurBet;
    var _iTotBet;
    var _iMoney;
    var _aMovingColumns;
    var _aStaticSymbols;
    var _aWinningLine;
    var _aReelSequence;
    var _aFinalSymbolCombo;
    var _oReelSound;
    var _oCurSymbolWinSound;
    var _oBg;
    var _oFrontSkin;
    var _oInterface;
    var _question;
    var _oPayTable = null;
    
    this._init = function(){
        _iCurState = GAME_STATE_IDLE;
        _iCurReelLoops = 0;
        _iNumReelsStopped = 0;
        _aReelSequence = new Array(0,1,2,3,4);
        _iNextColToStop = _aReelSequence[0];
        _iLastLineActive = NUM_PAYLINES;


        _iMoney = TOTAL_MONEY;
        _iCurBet = MIN_BET;
        _iTotBet = _iCurBet * _iLastLineActive;

        console.log('_iMoney  '+ _iMoney);
        console.log('_iCurBet  '+ _iCurBet);
        console.log('_iTotBet  '+ _iTotBet);

        s_oTweenController = new CTweenController();
        
        _oBg = new createjs.Bitmap(s_oSpriteLibrary.getSprite('bg_game'));

        // _oBg.scaleX=1.879;
        // _oBg.scaleY=1.36;

        s_oStage.addChild(_oBg);

        s_oStage.scaleX=RATIOX// 1.879;
        s_oStage.scaleY=RATIOY //1.36;

        this._initReels();

        _oFrontSkin = new createjs.Bitmap(s_oSpriteLibrary.getSprite('mask_slot'));

        // _oFrontSkin.scaleX=1.879;
        // _oFrontSkin.scaleY=1.36;

        s_oStage.addChild(_oFrontSkin);


        _oInterface = new CInterface(_iCurBet,_iTotBet,_iMoney);
        this._initStaticSymbols();
        _oPayTable = new CPayTablePanel();
        _bUpdate = true;



        // _question = function(entry) {
        //
        //     if(entry==='maxbet'){
        //
        //         console.log('maxbet ');
        //
        //     }
        //     if(entry==='spin'){
        //
        //         console.log('spin ');
        //
        //     }if(entry==='won'){
        //
        //         console.log('won ');
        //
        //     }
        //
        //
        //
        //
        // };


    };





    this.unload = function(){



        createjs.Sound.stop();
        
        s_oStage.removeChild(_oBg);
        s_oStage.removeChild(_oFrontSkin);
        _oInterface.unload();
        _oPayTable.unload();
        
        for(var k=0;k<_aMovingColumns.length;k++){
            _aMovingColumns[k].unload();
        }
        
        for(var i=0;i<NUM_ROWS;i++){
            for(var j=0;j<NUM_REELS;j++){
                _aStaticSymbols[i][j].unload();
            }
        } 
    };
    
    this._initReels = function(){  
        var iXPos = REEL_OFFSET_X;
        var iYPos = REEL_OFFSET_Y;



        var iCurDelay = 0;
        _aMovingColumns = new Array();
        for(var i=0;i<NUM_REELS;i++){ 
            _aMovingColumns[i] = new CReelColumn(i,iXPos,iYPos,iCurDelay);
            _aMovingColumns[i+NUM_REELS] = new CReelColumn(i+NUM_REELS,iXPos,iYPos + (SYMBOL_SIZE*NUM_ROWS),iCurDelay );
            iXPos += SYMBOL_SIZE + SPACE_BETWEEN_SYMBOLS;
            iCurDelay += REEL_DELAY;
        }
        
    };
    
    this._initStaticSymbols = function(){
        var iXPos = REEL_OFFSET_X;
        var iYPos = REEL_OFFSET_Y;
        _aStaticSymbols = new Array();
        for(var i=0;i<NUM_ROWS;i++){
            _aStaticSymbols[i] = new Array();
            for(var j=0;j<NUM_REELS;j++){
                var oSymbol = new CStaticSymbolCell(i,j,iXPos,iYPos);
                _aStaticSymbols[i][j] = oSymbol;
                
                iXPos += SYMBOL_SIZE + SPACE_BETWEEN_SYMBOLS;
            }
            iXPos = REEL_OFFSET_X;
            iYPos += SYMBOL_SIZE;
        }
    };
    
    this.generateFinalSymbols = function() {



          console.log('_iMoney  '+ _iMoney);
        console.log('_iCurBet  '+ _iCurBet);
        console.log('_iTotBet  '+ _iTotBet);





        _aFinalSymbolCombo = new Array();
        for (var i = 0; i < NUM_ROWS; i++) {
            _aFinalSymbolCombo[i] = new Array();
            for (var j = 0; j < NUM_REELS; j++) {
                var iRandIndex = Math.floor(Math.random() * s_aRandSymbols.length);
                var iRandSymbol = s_aRandSymbols[iRandIndex];
                _aFinalSymbolCombo[i][j] = iRandSymbol;
            }
        }

        //CHECK IF THERE IS ANY COMBO


        _aWinningLine = new Array();
        for (var k = 0; k < _iLastLineActive; k++) {
            var aCombos = s_aPaylineCombo[k];

            var aCellList = new Array();
            var iValue = _aFinalSymbolCombo[aCombos[0].row][aCombos[0].col];
            var iNumEqualSymbol = 1;
            var iStartIndex = 1;
            aCellList.push({
                row: aCombos[0].row,
                col: aCombos[0].col,
                value: _aFinalSymbolCombo[aCombos[0].row][aCombos[0].col]
            });

            while (iValue === WILD_SYMBOL && iStartIndex < NUM_REELS) {
                iNumEqualSymbol++;
                iValue = _aFinalSymbolCombo[aCombos[iStartIndex].row][aCombos[iStartIndex].col];
                aCellList.push({
                    row: aCombos[iStartIndex].row, col: aCombos[iStartIndex].col,
                    value: _aFinalSymbolCombo[aCombos[iStartIndex].row][aCombos[iStartIndex].col]
                });
                iStartIndex++;
            }

            for (var t = iStartIndex; t < aCombos.length; t++) {
                if (_aFinalSymbolCombo[aCombos[t].row][aCombos[t].col] === iValue ||
                    _aFinalSymbolCombo[aCombos[t].row][aCombos[t].col] === WILD_SYMBOL) {
                    iNumEqualSymbol++;

                    aCellList.push({
                        row: aCombos[t].row,
                        col: aCombos[t].col,
                        value: _aFinalSymbolCombo[aCombos[t].row][aCombos[t].col]
                    });
                } else {
                    break;
                }
            }

            if (s_aSymbolWin[iValue - 1][iNumEqualSymbol - 1] > 0) {
                _aWinningLine.push({
                    line: k + 1, amount: s_aSymbolWin[iValue - 1][iNumEqualSymbol - 1],
                    num_win: iNumEqualSymbol, value: iValue, list: aCellList
                });
            }


        }


        /// GAME GRYWALNOŚC TWEAKGAME /////
        global.gameCheck.gameNumber = global.gameCheck.gameNumber + 1;


        // gameControll(_aWinningLine,_iMoney,_iCurBet ,_iTotBet);

        var przedzial = 0;
        var wlaczProcent = 0;
        var wlaczNumerWygranych = 0;
        var stawkaL=0;
        var stawkaH=0;
        var sliderN=0;
        var sliderP=0;
        var resetN=false;
        var resetP=false;


        mala_min = parseInt(nconf.get('gameSettings:stawki:stawka_mala:min'));
        mala_max = parseInt(nconf.get('gameSettings:stawki:stawka_mala:max'));
        medium_min = parseInt(nconf.get('gameSettings:stawki:stawka_medium:min'));
        medium_max = parseInt(nconf.get('gameSettings:stawki:stawka_medium:max'));
        duza_min = parseInt(nconf.get('gameSettings:stawki:stawka_duza:min'));
        duza_max = parseInt(nconf.get('gameSettings:stawki:stawka_duza:max'));

        // win = global.WinTotal;

        win = parseInt(s_oInterface.getMoney());



        if (win >= mala_min && win <= mala_max) {
            przedzial = 'stawka min';
            wlaczProcent = nconf.get('gameSettings:controlGame:N_small');
            wlaczNumerWygranych = nconf.get('gameSettings:controlGame:P_small');

            sliderN=nconf.get('gameSettings:sliders:N_small');
            sliderP=nconf.get('gameSettings:sliders:P_small');

            stawkaL= mala_min;
            stawkaH= mala_max;

        }
        if (win >= medium_min && win <= medium_max) {
            przedzial = 'stawka medium';

            wlaczProcent = nconf.get('gameSettings:controlGame:N_medium');
            wlaczNumerWygranych = nconf.get('gameSettings:controlGame:P_medium');

            sliderN=nconf.get('gameSettings:sliders:N_medium');
            sliderP=nconf.get('gameSettings:sliders:P_medium');

            stawkaL= medium_min;
            stawkaH= medium_max;

        }
        if (win >= duza_min && win <= duza_max) {
            przedzial = 'stawka max';
            wlaczProcent = nconf.get('gameSettings:controlGame:N_max');
            wlaczNumerWygranych = nconf.get('gameSettings:controlGame:N_max');

            sliderN=nconf.get('gameSettings:sliders:N_max');
            sliderP=nconf.get('gameSettings:sliders:P_max');

            stawkaL= duza_min;
            stawkaH= duza_max;


        }


        win = parseInt(s_oInterface.getMoney());



        // ZLICZANIE WYGRANEJ
        if (_aWinningLine.length != 0) {
            global.currentWin = 0;

            // Dodanie kolejnej wygranej gry i ilosci wygranych

            global.gameCheck.iloscW = global.gameCheck.iloscW + 1;
            // console.log('Wygrana - iloscW' + global.gameCheck.iloscW);


            // ZLICZENIE WYGRANEJ Z OBROTU
            // Dodanie wygranej do całościowej i z aktualnego obrotu
            _aWinningLine.forEach(function (item) {
                console.log('current wincząstkowa '+ item['amount']);
                global.totalWinMoney=global.totalWinMoney+item['amount'];
                global.currentWin = global.currentWin + item['amount'];
                global.allWins = global.allWins + global.currentWin;
            });
            // odjęcie postawionej kasy//
            global.totalWinMoney=global.totalWinMoney-_iTotBet;




        }



        // PROCENT WYGRANYCH GIER / ilość gier


        global.procent = global.gameCheck.iloscW * 100 / global.gameCheck.gameNumber;

        _ia=_iMoney-_iTotBet;
        _ib=global.currentWin+_iMoney;


        // global.procentPrice= ((_ib-_ia)/_ia)*100;




        iloscGier = global.gameCheck.gameNumber;
        iloscWygranych = global.gameCheck.iloscW;
        // iloscWygranejKasy = global.currentWin;

        percentWin=((_ib-_ia)/_ia)*100;
        percentGames=iloscWygranych * 100 / iloscGier;



console.log('global.controlGameP ='+ global.controlGameP );
        console.log('percentWin ::'+  percentWin);
        console.log('sliderP ::'+  sliderP);
        console.log('wlaczProcent ='+  wlaczProcent);

        if (wlaczProcent == true) {
            global.controlGameP = true;


            if(percentWin>=sliderP){

                resetP=true;

                console.log('resetowanie gry przez procent wygranej / '+przedzial +' - '+ percentWin +' - '+ sliderP);

            }

        } else {
            global.controlGameP = false;

        }
        if (wlaczNumerWygranych == true) {
            global.controlGameN = true;


            if(percentGames>=sliderN){


                resetN=true;

                console.log('resetowanie gry przez proceontową ilośc wygranych wygranej/ '+przedzial +' - '+ percentGames +' - '+ sliderN);
            }



        } else {
            // global.controlGameN = false;

        }

if(    resetN==true || resetP==true){

   // this.generateFinalSymbols();
            console.log('HARD RESET');
}










        // Pobranie aktualnych danych
        // console.log("wygrana ?  "+_aWinningLine.length);



        /// GAME GRYWALNOŚC TWEAKGAME /////


        // _oInterface = new CInterface(_iCurBet,_iTotBet,_iMoney);
        // console.log(_oInterface);
    };
    
    this._generateRandSymbols = function() {



        var aRandSymbols = new Array();
        for (var i = 0; i < NUM_ROWS; i++) {
                var iRandIndex = Math.floor(Math.random()* s_aRandSymbols.length);
                aRandSymbols[i] = s_aRandSymbols[iRandIndex];
        }

        return aRandSymbols;
    };
    
    this.reelArrived = function(iReelIndex,iCol) {

        // console.log('function iReelIndex = '+iReelIndex);
        // console.log('function iCol = '+iCol);

        if(_iCurReelLoops>MIN_REEL_LOOPS ){
            if (_iNextColToStop === iCol) {
                if (_aMovingColumns[iReelIndex].isReadyToStop() === false) {
                    var iNewReelInd = iReelIndex;
                    if (iReelIndex < NUM_REELS) {
                            iNewReelInd += NUM_REELS;
                            
                            _aMovingColumns[iNewReelInd].setReadyToStop();
                            
                            _aMovingColumns[iReelIndex].restart(new Array(_aFinalSymbolCombo[0][iReelIndex],
                                                                        _aFinalSymbolCombo[1][iReelIndex],
                                                                        _aFinalSymbolCombo[2][iReelIndex]), true);
                            
                    }else {
                            iNewReelInd -= NUM_REELS;
                            _aMovingColumns[iNewReelInd].setReadyToStop();
                            
                            _aMovingColumns[iReelIndex].restart(new Array(_aFinalSymbolCombo[0][iNewReelInd],
                                                                          _aFinalSymbolCombo[1][iNewReelInd],
                                                                          _aFinalSymbolCombo[2][iNewReelInd]), true);
                            
                            
                    }
                    
                }
            }else {
                    _aMovingColumns[iReelIndex].restart(this._generateRandSymbols(),false);
            }
            
        }else {
            
            _aMovingColumns[iReelIndex].restart(this._generateRandSymbols(), false);
            if(iReelIndex === 0){
                _iCurReelLoops++;
            }
            
        }
    };
    
    this.stopNextReel = function() {
        _iNumReelsStopped++;

        if(_iNumReelsStopped%2 === 0){
            
            if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
                createjs.Sound.play("reel_stop");
            }
            
            _iNextColToStop = _aReelSequence[_iNumReelsStopped/2];
            if (_iNumReelsStopped === (NUM_REELS*2) ) {
                    this._endReelAnimation();
            }
        }    
    };
    
    this._endReelAnimation = function(){

        // console.log('endreel animation')
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oReelSound.stop();
        }
        
        _oInterface.disableBetBut(false);
        
        _iCurReelLoops = 0;
        _iNumReelsStopped = 0;
        _iNextColToStop = _aReelSequence[0];
        
        var iTotWin = 0;
        //INCREASE MONEY IF THERE ARE COMBOS
        if(_aWinningLine.length > 0){
            //HIGHLIGHT WIN COMBOS IN PAYTABLE
            for(var i=0;i<_aWinningLine.length;i++){
                _oPayTable.highlightCombo(_aWinningLine[i].value,_aWinningLine[i].num_win);
                _oInterface.showLine(_aWinningLine[i].line);
                var aList = _aWinningLine[i].list;
                for(var k=0;k<aList.length;k++){
                    _aStaticSymbols[aList[k].row][aList[k].col].show(aList[k].value);
                }
                
                _iMoney += _aWinningLine[i].amount;
                iTotWin += _aWinningLine[i].amount;
            }
            
            _oInterface.refreshMoney(_iMoney);
            _oInterface.refreshWinText(iTotWin);
            
            _iTimeElaps = 0;
            _iCurState = GAME_STATE_SHOW_ALL_WIN;
            
            if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
                _oCurSymbolWinSound = createjs.Sound.play("win", { volume:0.3});
            }
        }else{
            _iCurState = GAME_STATE_IDLE;
        }
        
        _oInterface.enableGuiButtons();
		
		if(_iMoney < _iTotBet){
			_oInterface.disableSpin();
		}


                                                        /// DO autoplay wysyłanie czy wygrana


        //Sprawdzanie autoplay
        temp=_aWinningLine.length;
        tempautoplay=autoplayEnabled;
        if (tempautoplay==true){


            // console.log(autoplayEnabled);


            if (temp==0){
                $(s_oMain).trigger("end_bet",[_iMoney,iTotWin,_aWinningLine.length]);

                s_oGame.onSpin();
            }
        }
        if (tempautoplay==false){

            $(s_oMain).trigger("end_bet",[_iMoney,iTotWin,_aWinningLine.length]);


            // console.log(autoplayEnabled);

        }
        //Sprawdzanie autoplay



    };

    this.hidePayTable = function(){
        _oPayTable.hide();
    };
    
    this._showWin = function(){

// POKAZYWANIE WYGRANYCH LINII

        var iLineIndex;
        if(_iCurWinShown>0){ 
            if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
                _oCurSymbolWinSound.stop();
            }
            
            iLineIndex = _aWinningLine[_iCurWinShown-1].line;
            _oInterface.hideLine(iLineIndex);
            
            var aList = _aWinningLine[_iCurWinShown-1].list;
            for(var k=0;k<aList.length;k++){
                _aStaticSymbols[aList[k].row][aList[k].col].stopAnim();
            }
        }
        
        if(_iCurWinShown === _aWinningLine.length){
            _iCurWinShown = 0;
        }
        
        iLineIndex = _aWinningLine[_iCurWinShown].line;
        _oInterface.showLine(iLineIndex);

        var aList = _aWinningLine[_iCurWinShown].list;
        for(var k=0;k<aList.length;k++){
            _aStaticSymbols[aList[k].row][aList[k].col].show(aList[k].value);
        }
            

        _iCurWinShown++;

        countre=_iCurWinShown;
        stateAutoplay=autoplayEnabled;
//        console.log(autoplayEnabled);
        //Sprawdzanie autoplay
        if (stateAutoplay==true){
            if (countre=_aWinningLine.length){
                s_oInterface._onSpin();
            }
        }



        //Sprawdzanie autoplay


        
    };
    
    this._hideAllWins = function(){
        for(var i=0;i<_aWinningLine.length;i++){
            var aList = _aWinningLine[i].list;
            for(var k=0;k<aList.length;k++){
                _aStaticSymbols[aList[k].row][aList[k].col].stopAnim();
            }
        }
        
        _oInterface.hideAllLines();

        _iTimeElaps = 0;
        _iCurWinShown = 0;
        _iTimeElaps = TIME_SHOW_WIN;
        _iCurState = GAME_STATE_SHOW_WIN;

        // console.log('hideAllWins');
    };
	
	this.activateLines = function(iLine){
        _iLastLineActive = iLine;
        this.removeWinShowing();
		
		var iNewTotalBet = _iCurBet * _iLastLineActive;

		_iTotBet = iNewTotalBet;
		_oInterface.refreshTotalBet(_iTotBet);
		_oInterface.refreshNumLines(_iLastLineActive);
		
		
		if(iNewTotalBet>_iMoney){
			_oInterface.disableSpin();
		}else{
			_oInterface.enableSpin();
		}
    };
	
	this.addLine = function(){
        if(_iLastLineActive === NUM_PAYLINES){
            _iLastLineActive = 1;  
        }else{
            _iLastLineActive++;    
        }
		
		var iNewTotalBet = _iCurBet * _iLastLineActive;

		_iTotBet = iNewTotalBet;
		_oInterface.refreshTotalBet(_iTotBet);
		_oInterface.refreshNumLines(_iLastLineActive);
		
		
		if(iNewTotalBet>_iMoney){
			_oInterface.disableSpin();
		}else{
			_oInterface.enableSpin();
		}
    };
    
    this.changeCoinBet = function(){
        var iNewBet = Math.floor((_iCurBet+0.05) * 100)/100;
		var iNewTotalBet;
		
        if(iNewBet>MAX_BET){
            _iCurBet = MIN_BET;
            _iTotBet = _iCurBet * _iLastLineActive;
            _oInterface.refreshBet(_iCurBet);
            _oInterface.refreshTotalBet(_iTotBet);
			iNewTotalBet = _iTotBet;
        }else{
            iNewTotalBet = iNewBet * _iLastLineActive;

			_iCurBet += 0.05;
			_iCurBet = Math.floor(_iCurBet * 100)/100;
			_iTotBet = iNewTotalBet;
			_oInterface.refreshBet(_iCurBet);
			_oInterface.refreshTotalBet(_iTotBet);       
        }
        
        if(iNewTotalBet>_iMoney){
			_oInterface.disableSpin();
		}else{
			_oInterface.enableSpin();
		}
		
    };
	
	this.onMaxBet = function(){
        var iNewBet = MAX_BET;
		_iLastLineActive = NUM_PAYLINES;
        
        var iNewTotalBet = iNewBet * _iLastLineActive;

		_iCurBet = MAX_BET;
		_iTotBet = iNewTotalBet;
		_oInterface.refreshBet(_iCurBet);
		_oInterface.refreshTotalBet(_iTotBet);
		_oInterface.refreshNumLines(_iLastLineActive);
        
		if(iNewTotalBet>_iMoney){
			_oInterface.disableSpin();
		}else{
			_oInterface.enableSpin();
			this.onSpin();
		}
    };
    
    this.removeWinShowing = function(){
        _oPayTable.resetHighlightCombo();
        
        _oInterface.resetWin();
        
        for(var i=0;i<NUM_ROWS;i++){
            for(var j=0;j<NUM_REELS;j++){
                _aStaticSymbols[i][j].hide();
            }
        }
        
        for(var k=0;k<_aMovingColumns.length;k++){
            _aMovingColumns[k].activate();
        }
        
        _iCurState = GAME_STATE_IDLE;
    };




    this.onSpin = function(){


      //  global.gameCheck.gameNumber=global.gameCheck.gameNumber+1;


        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            if(_oCurSymbolWinSound){
                _oCurSymbolWinSound.stop();
            }
            _oReelSound = createjs.Sound.play("reels");
        }
        
        
        _oInterface.disableBetBut(true);
        this.removeWinShowing();
        
        this.generateFinalSymbols();

        _oInterface.hideAllLines();
        _oInterface.disableGuiButtons();
        _iMoney -= _iTotBet;
        _oInterface.refreshMoney(_iMoney);
        
        _iCurState = GAME_STATE_SPINNING;


    };
    
    this.onInfoClicked = function(){
        if(_iCurState === GAME_STATE_SPINNING){
            return;
        }
        
        if(_oPayTable.isVisible()){
            _oPayTable.hide();
        }else{
            _oPayTable.show();
        }
    };

    this.onExit = function(){
        this.unload();
        s_oMain.gotoMenu();
        $(s_oMain).trigger("restart");
    };
    
    this.getState = function(){
        return _iCurState;
    };
    
    this.update = function(){

        // console.log('update');
        if(_bUpdate === false){
            return;
        }
        
        switch(_iCurState){
            case GAME_STATE_SPINNING:{
                for(var i=0;i<_aMovingColumns.length;i++){
                    _aMovingColumns[i].update();
                }


                break;
            }
            case GAME_STATE_SHOW_ALL_WIN:{
                    _iTimeElaps += s_iTimeElaps;
                    if(_iTimeElaps> TIME_SHOW_ALL_WINS){  
                        this._hideAllWins();
                    }
                    break;
            }
            case GAME_STATE_SHOW_WIN:{
                _iTimeElaps += s_iTimeElaps;
                if(_iTimeElaps > TIME_SHOW_WIN){
                    _iTimeElaps = 0;

                    this._showWin();
                }
                break;
            }
        }
        
	
    };
    
    s_oGame = this;
    
    MIN_REEL_LOOPS = oData.min_reel_loop;
    REEL_DELAY = oData.reel_delay;
    TIME_SHOW_WIN = oData.time_show_win;
    TIME_SHOW_ALL_WINS = oData.time_show_all_wins;
    TOTAL_MONEY = oData.money;
    
    this._init();
}

var s_oGame;
var s_oTweenController;
var budgetController = (function(){
    
    var Expense = function(id,description,value)
    {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var income = function(id,description,value)
    {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type)
    {
        var sum=0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        data.totals[type] = sum;
    }
    
    var data = {
        allItems : {
            inc : [],
            exp : []
        },
        totals : {
            inc : 0,
            exp : 0
        },
        budget : 0,
        percentage :-1
    };
    
    return{
        addNewItem : function(type,desp,val){
            var ID,newItem;
            
            if(data.allItems[type].length >0)
                {
                    ID = data.allItems[type][data.allItems[type].length-1].id +1;
                }
            else{
                ID = 0;
            }
            if(type === 'inc'){
                newItem = new income(ID,desp,val);
            }
            else if(type === 'exp'){
                newItem = new Expense(ID,desp,val);
            }
            
            data.allItems[type].push(newItem);
            return newItem;   
        },
        
        deleteItem : function(type,id){
            var ids,index;
            
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
            
            
        },
        
        calculateBudget : function(){
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc-data.totals.exp;
            if(data.totals.exp > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
            }
            else{
                data.percentage = -1;
            }
            
        },
        
        getBudget : function(){
            return{
                budget : data.budget,
                totalinc : data.totals.inc,
                totalexp : data.totals.exp,
                percentage : data.percentage
            };
        }  
    };    
})();



var uiController = (function(){
   var domStrings = {
       inputbtn  : '.add__btn',
       inputtype : '.add__type',
       inputdesp : '.add__description',
       inputval  : '.add__value',
       incList   : '.income__list',
       expList   : '.expenses__list',
       budgetTitle : '.budget__value',
       incomeLabel : '.budget__income--value',
       expenseLabel : '.budget__expenses--value',
       percentageLabel : '.budget__expenses--percentage',
       container   : '.container'
    };
    
    
    return{
        
        getInput : function(){
            return{
                type : document.querySelector(domStrings.inputtype).value,
                description :document.querySelector(domStrings.inputdesp).value,
                value : parseFloat(document.querySelector(domStrings.inputval).value)
            }
        },
        addList : function(obj,type){
            var html,newHtml,element;
            
            if(type === 'inc'){
                element = domStrings.incList;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if(type === 'exp'){
                element = domStrings.expList;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',obj.value);
            
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
            
        },
        
        clearFeilds : function(){
            var feild,feildsarr;
            
            feild = document.querySelectorAll(domStrings.inputdesp + ',' + domStrings.inputval);
            feildsarr = Array.prototype.slice.call(feild);
            feildsarr.forEach(function(cur,index,arr){
               cur.value = "" ;
            });
            feildsarr[0].focus(); 
        },
        
        displayBudget : function(obj){
             document.querySelector(domStrings.budgetTitle).textContent = obj.budget;
             document.querySelector(domStrings.incomeLabel).textContent = obj.totalinc;
             document.querySelector(domStrings.expenseLabel).textContent = obj.totalexp;
            if(obj.percentage > 0)
                {
                      document.querySelector(domStrings.percentageLabel).textContent = obj.percentage;
                }
            else{
                  document.querySelector(domStrings.percentageLabel).textContent = "---";
            }
           
        },
        
        deleteItem : function(selectorid){
            var ele;
            ele = document.getElementById(selectorid);
            ele.parentElement.removeChild(ele);
        },
        
        getDomStrings : function(){
            return domStrings;
        }
    };
    
    
})();




var appController = (function(budCtrl,uiCtrl){
    
    var setUpEvents = function(){
        var DOM = uiCtrl.getDomStrings();
        document.querySelector(DOM.inputbtn).addEventListener('click',CtrlSec);
        document.addEventListener('keypress',function(e){
            if(e.keyCode === 13)
                {
                    CtrlSec();
                } 
        }); 
        document.querySelector(DOM.container).addEventListener('click',deleteItem);
    };
    
    
    var updateBudget = function(){
        budCtrl.calculateBudget();
        var budget = budCtrl.getBudget();
        
        uiCtrl.displayBudget(budget);
        
    };
    
     var CtrlSec = function(){
         var newItem;
         var input = uiCtrl.getInput();
         if(input.description !== "" && !isNaN(input.value) && input.value>0){
             newItem=budCtrl.addNewItem(input.type,input.description,input.value);
             
             uiCtrl.addList(newItem,input.type);
             
             uiCtrl.clearFeilds();
             
             updateBudget();
         }
     };
    
    
    var deleteItem = function(event){
        var ID,splitID,itemId,type;
        
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        //console.log(itemId);
        if(itemId){
            splitID = itemId.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
             budCtrl.deleteItem(type,ID);
        
            uiCtrl.deleteItem(itemId);
        
            updateBudget();
        
        }
    };
    
    
    
    
    
    return{
        init :function(){
            setUpEvents();
            uiCtrl.displayBudget({
                budget : 0,
                totalexp: 0,
                totalinc: 0,
                percentage : -1
            });
        }
        
    };
    
})(budgetController,uiController);

appController.init();
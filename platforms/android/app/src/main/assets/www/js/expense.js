let db = null
let isDbReady = null
let tID = null
let tName = null

const SQL_CREATE_TABLE_EXPENSE = 'CREATE TABLE IF NOT EXISTS `expense`(`id` INTEGER PRIMARY KEY AUTOINCREMENT,`tid` INTEGER NOT NULL DEFAULT 0, `expenseName` TEXT, `expenseAmount` REAL)'
const SQL_SELECT_EXPENSE = 'SELECT `id`, `expenseName`, `expenseAmount` FROM `expense` WHERE `tid`=? ORDER BY `id` DESC'
const SQL_INSERT_EXPENSE = 'INSERT INTO `expense`(`tid`,`expenseName`,`expenseAmount`) VALUES (?,?,?)'

function showError(message){
    navigator.notification.alert(message, null, 'Error', 'OK')
    navigator.notification.beep(1)
    navigator.vibrate(2000)
}

function refreshList(){
    if(!isDbReady){
        showError('Database not ready. Please reload the app.')
        return
    }
    viewExpenseCardList()
}


function onAddExpenseClicked(){
    if(!isDbReady){
        showError('Database not ready. Please reload the app.')
        return
    }

    // get input from UI (index.html)
    //let tid             = $.trim($('#text-tid').val())
    let expenseName     = $.trim($('#text-expense-name').val())
    let expenseAmount   = $.trim($('#text-expense-amount').val())

    // input validate
    // show error if it is not
    if(tID === '' || expenseName === '' || expenseAmount === ''){
        showError("All fields are required.")
        return
    }

    db.transaction(
        function(tx) { 
            tx.executeSql(
                SQL_INSERT_EXPENSE,
                [tID, expenseName, expenseAmount],
                function(tx, result) { 
                    $('#text-tid').val('')
                    $('#text-expense-name').val('')
                    $('#text-expense-amount').val('')
                    refreshList()
                },
                function(tx, error) { 
                    showError('Failed to add expense.')
                }
            )
        },
        function(error) { },
        function() { 
            navigator.notification.alert('Successful adding new expense', null, 'Status', 'OK')
        }
    )
}

function viewExpenseCardList(){
    db.transaction(
        function(tx) { 
            tx.executeSql(
                SQL_SELECT_EXPENSE,
                [tID],
                function(tx, result) { 
                    $('#expense-list').empty()
                    for(let index = 0; index < result.rows.length; index++){

                        let divSubheading   = $('<div></div>')
                                            .addClass('fw-bold')
                                            .text(result.rows.item(index).expenseName)

                        let divList = $('<div></div>')
                                    .addClass('ms-2 me-auto')

                        let span    = $('<span></span>')
                                    .addClass('badge bg-primary rounded-pill')
                                    .text(result.rows.item(index).expenseAmount)

                        let li  = $('<li></li>')
                                .addClass('list-group-item d-flex justify-content-between align-items-start')

                        let ol  = $('<ol></ol>')
                                .addClass('list-group list-group-numbered')
                    
                        divList.append(divSubheading)
                        li.append(divList).append(span)
                        ol.append(li)
                        $('#expenses-list').append(ol)
                    }          
                },
                function(tx, error) { 
                    showError('Failed to view expense list.')
                }
            )
        },
        function(error) { },
        function() { 
            //navigator.notification.alert('Data Retrieval Successful', null, 'Status', 'OK') 
        }
    )
}

document.addEventListener('deviceready', function(){
    Zepto(function($){
      $('#button-add-expense').on('click', onAddExpenseClicked)

        db = window.sqlitePlugin.openDatabase({
            name: 'trip.db',
            location: 'default'
        },
        function(database){                       // SUCCESS CALLBACK
            db = database
            db.transaction(
                function(tx){
                    tx.executeSql(
                        SQL_CREATE_TABLE_EXPENSE,
                        [],
                        function(tx, result) {      // SUCCESS CALLBACK
                            isDbReady = true
                            console.log('SQL_CREATE_TABLE_EXPENSE', 'OK')
                        },                          
                        function(tx, error) {       // ERROR CALLBACK
                            isDbReady = false
                            console.log('SQL_CREATE_TABLE_EXPENSE ERROR', error.message)
                        }     
                    )
                },
                function(error) {                   // ERROR CALLBACK
                    isDbReady = false
                },                
                function() { }                      // SUCCESS CALLBACK
            )
        },
        function(error){ }                         // ERROR CALLBACK
        ); 

        let allParameters = new URLSearchParams(window.location.search)
        let parameter = JSON.parse(allParameters.get('params'))

        tID     = parameter.tripID
        tName   = parameter.tripName

        console.log(tID)
        console.log(tName)

        $('#text-trip-id').text(tID)
        $('#text-trip-name').text(tName)

        viewExpenseCardList()
    })
}, false);
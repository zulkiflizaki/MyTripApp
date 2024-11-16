let db = null
let isDbReady = null
let isUpdate = null
let trip_id = null

const SQL_CREATE_TABLE_TRIP = 'CREATE TABLE IF NOT EXISTS `trip`(`id` INTEGER PRIMARY KEY AUTOINCREMENT,`title` TEXT,`date` INTEGER,`travelers` TEXT, `budget` REAL, `price` REAL, `timestamp` NUMERIC)'
const SQL_INSERT_TRIP = 'INSERT INTO `trip`(`title`,`date`,`travelers`,`budget`,`price`,`timestamp`) VALUES (?,?,?,?,?,?)'
const SQL_UPDATE_TRIP = 'UPDATE `trip` SET `title` = ?, `date` = ?, `travelers`= ?, `budget`=?, `price` = ? WHERE `id` = ?'


function showError(message){
    navigator.notification.alert(message, null, 'Error', 'OK')
    navigator.notification.beep(1)
    navigator.vibrate(2000)
}

function onAddTripClicked(){
    if(!isDbReady){
        showError('Database not ready. Please reload the app.')
        return
    }

    // get input from UI (index.html)
    let title     = $.trim($('#text-title').val())
    let date      = $.trim($('#text-date').val())
    let travelers = $.trim($('#text-travelers').val())
    let budget    = $.trim($('#text-budget').val())
    let price     = $.trim($('#text-price').val())
    let timestamp = new Date().getTime()

    // input validate
    // show error if it is not
    if(title === '' || date === '' || travelers === '' || budget === '' || price === ''){
        showError("All fields are required.")
        return
    }

    db.transaction(
        function(tx) { 
            tx.executeSql(
                SQL_INSERT_TRIP,
                [title, date, travelers, budget, price, timestamp],
                function(tx, result) { 
                    $('#text-title').val('')
                    $('#text-date').val('')
                    $('#text-travelers').val('') 
                    $('#text-budget').val('')
                    $('#text-price').val('')
                },
                function(tx, error) { 
                    showError('Failed to add trip.')
                }
            )
        },
        function(error) { },
        function() { 
            navigator.notification.alert('Successful adding new trip', null, 'Status', 'OK') 
            window.location.href = "index.html"
        }
    )
}

function onUpdateTripClicked(){
    if(!isDbReady){
        showError('Database not ready. Please reload the app.')
        return
    }

    // get input from UI (index.html)
    let updateTitle     = $.trim($('#text-title').val())
    let updateDate      = $.trim($('#text-date').val())
    let updateTraveler  = $.trim($('#text-travelers').val())
    let updateBudget    = $.trim($('#text-budget').val())
    let updatePrice     = $.trim($('#text-price').val())
    // let timestamp = new Date().getTime()

    // input validate
    // show error if it is not
    if(updateTitle === '' || updateDate === '' || updatePrice === '' || updateTraveler === '' || updateBudget === ''){
        showError("All fields are required.")
        return
    }

    db.transaction(
        function(tx) { 
            tx.executeSql(
                SQL_UPDATE_TRIP,
                [updateTitle, updateDate, updateTraveler, updateBudget, updatePrice, trip_id],
                function(tx, result) { 
                    $('#text-title').val('')
                    $('#text-date').val('')
                    $('#text-travelers').val('')
                    $('#text-budget').val('')
                    $('#text-price').val('')
                },
                function(tx, error) { 
                    showError('Failed to update trip.')
                }
            )
        },
        function(error) { },
        function() { 
            window.location.reload
            navigator.notification.alert('Successful update trip', null, 'Status', 'OK')  
            window.location.href = "index.html"
        }
    )
}


document.addEventListener('deviceready', function(){
    Zepto(function($){

        $('#button-add-trip').show()
        $('#button-update-trip').hide()

        $('#button-add-trip').on('click', onAddTripClicked)
        $('#button-update-trip').on('click', onUpdateTripClicked)

            db = window.sqlitePlugin.openDatabase({
                name: 'trip.db',
                location: 'default'
            },
            function(database){                       // SUCCESS CALLBACK
                db = database
                db.transaction(
                    function(tx){
                        tx.executeSql(
                            SQL_CREATE_TABLE_TRIP,
                            [],
                            function(tx, result) {      // SUCCESS CALLBACK
                                isDbReady = true
                                console.log('SQL_CREATE_TABLE_TRIP', 'OK')
                            },                          
                            function(tx, error) {       // ERROR CALLBACK
                                isDbReady = false
                                console.log('SQL_CREATE_TABLE_TRIP ERROR', error.message)
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

            isUpdate    = parameter.isUpdate
            trip_id     = parameter.tid
            $('#text-title').val(parameter.title)
            $('#text-date').val(parameter.date)
            $('#text-travelers').val(parameter.travelers)
            $('#text-budget').val(parameter.budget)
            $('#text-price').val(parameter.price)
            
            if(isUpdate){
                $('#button-update-trip').show()
                $('#button-add-trip').hide()
            }
        })
}, false);
let db = null
let isDbReady = null

const SQL_CREATE_TABLE_TRIP = 'CREATE TABLE IF NOT EXISTS `trip`(`id` INTEGER PRIMARY KEY AUTOINCREMENT,`title` TEXT,`date` INTEGER,`travelers` TEXT, `budget` REAL, `price` REAL, `timestamp` NUMERIC)'
const SQL_SELECT_TRIP = 'SELECT `id`, `title`, `date`, `travelers`, `budget`, `price`, `timestamp` FROM `trip` ORDER BY `id` DESC'
const SQL_DELETE_TRIP = 'DELETE FROM `trip` WHERE `id` = ?'
const SQL_DROP_TABLE = 'DROP TABLE IF EXISTS `trip`'


function showError(message){
    navigator.notification.alert(message, null, 'Error', 'OK')
    navigator.notification.beep(1)
    navigator.vibrate(2000)
}


function onAddNewTrip(){
    window.location.href = "trip.html"
}


function onDeleteTrip(){
    if(!isDbReady){
        showError('Database not ready. Please reload the app.')
        return
    }

    db.transaction(
        function(tx) { 
            tx.executeSql(
                SQL_DROP_TABLE,
                function(tx, result) { 
                    //window.location.href = "index.html"
                },
                function(tx, error) { 
                    //showError('Failed to drop table.')
                }
            )
        },
        function(error) { },
        function() { 
            navigator.notification.alert('Data Delete Successful', null, 'Status', 'OK')
            window.location.reload()
        }
    )
}


function deleteTrip(trip_id){
    if(!isDbReady){
        showError('Database not ready. Please reload the app.')
        return
    }

    db.transaction(
        function(tx) { 
            tx.executeSql(
                SQL_DELETE_TRIP,
                [trip_id],
                function(tx, result) { 
                    refreshList()
                },
                function(tx, error) { 
                    showError('Failed to delete trip.')
                }
            )
        },
        function(error) { },
        function() { 
            navigator.notification.alert('Data Retrieval Successful', null, 'Status', 'OK') 
            // TODO: Replace with Toast
        }
    )
}

function refreshList(){
    if(!isDbReady){
        showError('Database not ready. Please reload the app.')
        return
    }
    viewTripCardList()
}

function viewTripCardList(){
    db.transaction(
        function(tx) { 
            tx.executeSql(
                SQL_SELECT_TRIP,
                [],
                function(tx, result) { 
                    $('#trip-list').empty()
                    for(let index = 0; index < result.rows.length; index++){
                        
                        let h5number = $('<h5></h5>')
                                    .addClass('card-title')
                                    .text(`${index + 1}`)

                        let h5title = $('<h5></h5>')
                                    .addClass('card-title')
                                    .text(`${result.rows.item(index).title}`)

                        let h6Date  = $('<h6></h6>')
                                    .addClass('card-subtitle mb-2 text-body-secondary')
                                    .text(`Date of Trip: ${result.rows.item(index).date}`)

                        let h6Travelers  = $('<h6></h6>')
                                    .addClass('card-subtitle mb-2 text-body-secondary')
                                    .text(`No. of Travelers: ${result.rows.item(index).travelers}`)            

                        var timestampDate = new Date(result.rows.item(index).timestamp)

                        let h6TimeStamp = $('<h6></h6>')
                                        .addClass('card-subtitle mb-2 text-body-secondary')
                                        //.text(`Created on: ${result.rows.item(index).timestamp}`)
                                        .text(`Created on: ${timestampDate.toLocaleString()}`)
                        
                        let pBudget = $('<p></p>')
                                .addClass('card-text')
                                .text(`RM ${parseFloat(result.rows.item(index).budget).toFixed(2)}`)

                        let pPrice   = $('<p></p>')
                                .addClass('card-text')
                                .text(`RM ${parseFloat(result.rows.item(index).price).toFixed(2)}`)

                        let aAddExpense = $('<a></a>')
                                        .addClass('card-link')
                                        .text(`Add Expenses`)
                                        //.attr('href', '#')
                                        .on('click', function(){
                                            let expenseData = JSON.stringify({
                                                'tripID'      : result.rows.item(index).id,
                                                'tripName'    : result.rows.item(index).title,
                                            })
                                            window.open('expense.html?params=' + encodeURIComponent(expenseData), 'editWindow')
                                        })
                                        
                        let aUpdateTrip = $('<a></a>')
                                        .addClass('card-link')
                                        .text(`Edit Trip`)
                                        //.attr('trip-id', result.rows.item(index).id)
                                        .on('click', function(){
                                            let tripData = JSON.stringify({
                                                'isUpdate'  : true,
                                                'tid'       : result.rows.item(index).id,
                                                'title'     : result.rows.item(index).title,
                                                'date'      : result.rows.item(index).date,
                                                'travelers' : result.rows.item(index).travelers,
                                                'budget'    : result.rows.item(index).budget,
                                                'price'     : result.rows.item(index).price,
                                            })
                                            window.open('trip.html?params=' + encodeURIComponent(tripData), 'editWindow')
                                        })

                        let aDeleteTrip = $('<a></a>')
                                        .addClass('card-link')
                                        .text(`Delete Trip`)
                                        .attr('trip-id', result.rows.item(index).id)
                                        .on('click', function(){
                                            let trip_id = $(this).attr('trip-id')
                                            navigator.notification.confirm(
                                                `Delete trip ${result.rows.item(index).title}?`,
                                                function(buttonIndex){
                                                    if(buttonIndex===1){
                                                        deleteTrip(trip_id)
                                                    }
                                                },
                                                'Delete Trip',
                                                ['Proceed','Cancel']
                                            );
                                        })

                        let divBody     = $('<div></div>')
                                        .addClass('card-body')
                                        .append(h5number)
                                        .append(h5title)
                                        .append(h6Date)
                                        .append(h6Travelers)
                                        .append(h6TimeStamp)
                                        .append(pBudget)
                                        .append(pPrice)
                                        .append(aAddExpense)
                                        .append(aUpdateTrip)
                                        .append(aDeleteTrip)

                        let divCard     = $('<div></div>')
                                        .addClass('card mb-2')
                                        .append(divBody)

                        $('#trip-list').append(divCard)    
                    }          
                },
                function(tx, error) { 
                    showError('Failed to view trip list.')
                }
            )
        },
        function(error) { },
        function() { 
            //navigator.notification.alert('Successfully retrieved the data', null, 'Status', 'OK')
            //window.location.reload()
        }
    )
}


document.addEventListener('deviceready', function(){
    Zepto(function($){
        
        $('#button-add').on('click', onAddNewTrip)
        $('#button-delete').on('click', onDeleteTrip)


        $('#text-search').on('keyup', function(){
            var value = $(this).val().toLowerCase()
            $('#trip-list div').filter(function(){
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            })
        })

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
        viewTripCardList()
    })
}, false);
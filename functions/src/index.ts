import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

export const onBostonWeatherUpdate = functions.firestore.document("cities-weather/boston-ma-us")
.onUpdate(change =>{
    const after = change.after.data()
    const payload = {
        data:{
            temp: String(after!.temp),
            condition: after!.conditions
        }
    }
    
    return admin.messaging().sendToTopic('Weather_boston-ma-us', payload);
    
    
});

export const getBostonWeather = functions.https.onRequest((request, response) => {
    
    admin.firestore().doc('cities-weather/boston-ma-us').get()
    .then(snapshot => {
        const data = snapshot.data();
        console.log(data);
        
        response.send(request.params);
    })
    .catch(error =>{
        console.log(error);
        response.status(500).send(error);
    });
});

export const getData = functions.https.onRequest((request, response) => {
    const data = {
        temp : '12',
        condition : 'reaining'
    }
    admin.firestore().collection('notification').add(data)
    .then(sanpshot=>{
        console.log(sanpshot)
        response.status(200).send(request.query.invoice_id);
    })
    .catch(error =>{
        console.log(error);
        response.status(500).send('not good');
    });
});


export const getBostonAreaWeather = 
functions.https.onRequest(async (request, response) => {
    
    try {
        const areaSnapshot = await admin.firestore().doc('areas/greater-boston').get()        
        const cities = areaSnapshot.data()!.cities
        const promises = []
        for(const city in cities){
            const p = admin.firestore().doc(`cities-weather/${city}`).get()
            promises.push(p)
        }        
        const citySnapshots =  await Promise.all(promises);
        const results = Array;
        citySnapshots.forEach(citySanp => {
            const data = citySanp.data()
            data!.city = citySanp.id
            results.apply(data)
        })
        response.send(results);        
    } catch (error) {
        console.log(error);
        response.status(500).send('not this one');
    }
    
})


// function for pizza

export const onMessageCreate = functions.firestore.document('/rooms/{roomID}/messages/{messageID}')
.onCreate((snapshot, context) => {
    const roomID = context.params.roomID
    const messageID = context.params.messageID
    console.log(`New message ${messageID} in room ${roomID}`)
    console.log(snapshot)

})  

export const onMessageUpdate = functions.firestore.document('/rooms/{roomID}/messages/{messageID}')
.onUpdate((snapshot, context) => {
    const roomID = context.params.roomID
    const messageID = context.params.messageID
    console.log(`New message ${messageID} in room ${roomID}`)
    console.log(snapshot)

})  

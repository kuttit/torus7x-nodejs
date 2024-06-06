var { Kafka } = require('kafkajs')
const kafka = new Kafka({
    clientId: 'producer',
    brokers: ['192.168.2.233:31237']
})

const consumer = kafka.consumer({ groupId: 'TRACE_LOG-groups1', allowAutoTopicCreation: true })
try {
    const run = async () => {
        // Consuming
        await consumer.connect()
        await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })
        // const { HEARTBEAT } = consumer.events
        // consumer.on(HEARTBEAT, e =>
        //     console.log(`heartbeat at ${e.timestamp}`
        //     ))
        var isPaused = false;
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log({
                    partition,
                    offset: message.offset,
                    value: message.value.toString(),
                });
                if (!isPaused) {
                    isPaused = true;
                    setTimeout(async () => {
                        await consumer.pause([{ "topic": "test-topic" }])
                        doProcessandResume(consumer)
                        console.log('Consumer paused...........')
                    }, 5000)
                }
            }
        })
        function doProcessandResume() {
            // Do the process here 
            setTimeout(() => {
                isPaused = false
                consumer.resume([{ "topic": 'test-topic' }]);
                console.log('Consumer resumed..............')
            }, 40000)
        }


        // await consumer.run({
        //     eachBatch: async ({ batch, resolveOffset, heartbeat }) => {
        //         consumer.pause([{ "topic": 'test-topic' }])
        //         for (let message of batch.messages) {
        //             console.log(
        //                 "message from consumer",
        //                 batch.topic,
        //                 batch.partition,
        //                 message.value.toString()
        //             )
        //             // await sleep(300).then(() => {
        //             //     console.log("sleeping")
        //             // })
        //             await resolveOffset(message.offset)
        //             await heartbeat()
        //         }

        //         consumer.resume([{ "topic": batch.topic }])
        //     }
        // })
    }
    run().catch(console.error)
} catch (error) {
    console.log(error)
}
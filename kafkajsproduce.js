var { Kafka } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'producer',
    // brokers: ['192.168.2.233:31237']
    brokers: ['192.168.2.251:9092']
})

const producer = kafka.producer()
//const consumer = kafka.consumer({ groupId: 'test-group' })

const run = async () => {
    // Producing
    await producer.connect()
    await producer.send({
        topic: 'test',
        messages: [
            { value: 'kafka message test !' },
        ],
    })

}

// run().catch(console.error)
setInterval(() => { run().catch(console.error) }, 100)

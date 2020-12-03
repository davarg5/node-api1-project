
const express = require('express');
const shortid = require('shortid');
const cors = require('cors');

const server = express();

server.use(express.json());
server.use(cors());

// fake users
let users = [
    {
        id: shortid.generate(), 
        name: "Jane Doe",
        bio: "Not Tarzan's Wife, another Jane", 
    }
]

// helper functions
const User = {
    getAll() {
        return Promise.resolve(users);
    },
    getById(id) {
        return Promise.resolve(users.find(user => user.id === id));
    },
    createNew(user) {
        const newUser = { id: shortid.generate(), ...user};
        users.push(newUser);
        return Promise.resolve(newUser);
    },
    delete(id) {
        const user = users.find(user => user.id === id);
        if(user) {
            users = users.filter(user => {
                return Promise.resolve(user.id !== id)
            })
        }
        return Promise.resolve(user);
    },
    update(id, changes) {
        const user = users.find(user => user.id === id);
        if(!user) {
            return Promise.resolve(null);
        }
        else {
            const updatedUser = { id, ...changes }
            users = users.map(user => {
                if(user.id === updatedUser.id) {
                    return updatedUser;
                }
                return user;
            })
            return Promise.resolve(updatedUser);
        }
    }
}

//endpoints 
server.post('/api/users', (req, res) => {
    const userFromClient = req.body;

    if(!userFromClient.name || !userFromClient) {
        res.status(400).json({ message: 'name and bio required!' })
    }
    else {
        User.createNew(userFromClient)
            .then((newlyCreatedUser) => {
                return res.status(201).json(newlyCreatedUser);
            })
            .catch(() => {
                return res.status(500).json({ errorMessage: "There was an error while saving the user to the database" })
            })         
    }
})

server.get('/api/users', (req, res) => {
    User.getAll()
        .then((users) => {
            return res.status(200).json(users);
        })
        .catch(() => {
            return res.status(500).json({ errorMessage: "The users information could not be retrieved." });
        })
})

server.get('/api/users/:id', (req, res) => {
    const { id } = req.params;

    User.getById(id)
        .then((user) => {
            if(user) {
                return res.status(200).json(user);
            }
            else {
                return res.status.json({ message: "The user with the specified ID does not exist." });
            }
        })
        .catch(() => {
                return res.status(500).json({ errorMessage: "The user information could not be retrieved." });
        })
})

server.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;

    User.delete(id)
        .then((user) => {
            if(user) {
                return res.status(200).json(user);
            }
            else {
                return res.status(404).json({ message: "The user with the specified ID does not exist." });
            }
        })
        .catch(() => {
            return res.status(500).json({ errorMessage: "The user could not be removed" });
        })
})

server.put('/api/users/:id', (req, res) => {
    const changes = req.body;
    const { id } = req.params;

    User.update(id, changes)
        .then((users) => {
            if(!users) {
                return res.status(404).json({ message: "The user with the specified ID does not exist." });
            }
            if(!changes.name || !changes.bio) {
                return res.status(400).json({ errorMessage: "Please provide name and bio for the user." });
            }
            else {
                return res.status(200).json(users);
            }
        })
        .catch(() => {
            return res.status(500).json({ errorMessage: "The user information could not be modified." });
        })


})

// catch-all endpoint
server.use('*', (req, res) => {
    res.status(404).json({ message: 'not found' });
})

server.listen(5000, () => {
    console.log('listening on port 5000');
})


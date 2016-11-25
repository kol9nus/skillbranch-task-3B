import express from 'express';
import cors from 'cors';
import fs from 'fs';

const pets = JSON.parse(fs.readFileSync('pets.json', 'utf-8'));

function getConditionCheckerByField(field, value, operation = 0) {
  return user =>
    (user[field] === value && operation === 0)
    || (user[field] > value && operation === 1)
    || (user[field] < value && operation === -1);
}

function findUser(identifier) {
  let isUserSatisfiesCondition = getConditionCheckerByField('username', identifier);
  if (!isNaN(identifier)) {
    isUserSatisfiesCondition = getConditionCheckerByField('id', Number(identifier));
  }

  return JSON.parse(JSON.stringify(pets.users)).find(isUserSatisfiesCondition);
}

function getPets(userId) {
  return pets.pets.filter(pet => pet.userId === userId);
}

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send(pets);
});

app.get('/users', (req, res) => {
  let users = JSON.parse(JSON.stringify(pets.users));
  if (req.query.havePet) {
    users = users.filter(
      user => getPets(user.id).some(
        pet => pet.type === req.query.havePet
      )
    );
  }
  res.send(users);
});

app.get('/users/populate', (req, res) => {
  let users = JSON.parse(JSON.stringify(pets.users));
  if (req.query.havePet) {
    users = users.filter(
      user => getPets(user.id).some(
        pet => pet.type === req.query.havePet
      )
    );
  }
  users = users.map((user) => {
    user.pets = getPets(user.id);

    return user;
  });
  res.send(users);
});

app.get('/users/:identifier', (req, res) => {
  const user = findUser(req.params.identifier);
  if (user) {
    res.send(user);
  } else {
    res.sendStatus(404);
  }
});

app.get('/users/:identifier/populate', (req, res) => {
  const user = findUser(req.params.identifier);
  if (user) {
    user.pets = getPets(user.id);
    res.send(user);
  } else {
    res.sendStatus(404);
  }
});

app.get('/users/:identifier/pets', (req, res) => {
  const user = findUser(req.params.identifier);
  if (user) {
    res.send(getPets(user.id));
  } else {
    res.sendStatus(404);
  }
});

app.get('/pets', (req, res) => {
  let resultPets = JSON.parse(JSON.stringify(pets.pets));
  if (req.query.type) {
    resultPets = resultPets.filter(getConditionCheckerByField('type', req.query.type));
  }
  if (req.query.age_gt) {
    resultPets = resultPets.filter(getConditionCheckerByField('age', req.query.age_gt, 1));
  }
  if (req.query.age_lt) {
    resultPets = resultPets.filter(getConditionCheckerByField('age', req.query.age_lt, -1));
  }
  res.send(resultPets);
});

app.get('/pets/populate', (req, res) => {
  let populatedPets = JSON.parse(JSON.stringify(pets.pets));
  if (req.query.type) {
    populatedPets = populatedPets.filter(getConditionCheckerByField('type', req.query.type));
  }
  if (req.query.age_gt) {
    populatedPets = populatedPets.filter(getConditionCheckerByField('age', req.query.age_gt, 1));
  }
  if (req.query.age_lt) {
    populatedPets = populatedPets.filter(getConditionCheckerByField('age', req.query.age_lt, -1));
  }
  populatedPets = populatedPets.map((pet) => {
    pet.user = pets.users.find(getConditionCheckerByField('id', pet.userId));

    return pet;
  });
  res.send(populatedPets);
});

app.get('/pets/:id', (req, res) => {
  const findPet = getConditionCheckerByField('id', Number(req.params.id));
  const pet = JSON.parse(JSON.stringify(pets.pets)).find(findPet);
  if (pet) {
    res.send(pet);
  } else {
    res.sendStatus(404);
  }
});

app.get('/pets/:id/populate', (req, res) => {
  const findPet = getConditionCheckerByField('id', Number(req.params.id));
  const pet = JSON.parse(JSON.stringify(pets.pets)).find(findPet);
  pet.user = pets.users.find(getConditionCheckerByField('id', pet.userId));
  if (pet) {
    res.send(pet);
  } else {
    res.sendStatus(404);
  }
});

app.use((req, res, next) => {
  console.log('123');
  res.sendStatus(404);
  next();
});

app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});

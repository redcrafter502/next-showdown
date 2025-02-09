Schema: format for eraser.io

nominationRequests {
  id int pk
  urlId string
  name string
  listName string
  traktUserId string
  nominatableSeasonCount int
  state enum(open,closed)

  createdAt timestamp
}

nominations {
  id string pk
  nominationRequestId int fk
  nominatedSeasonId string
  count int
  userId string fk
  state enum(open,selected,discarded)

  createdAt timestamp
}

users {
  id string pk
  name string

  createdAt timestamp
}

seasons {
  id int pk
  nominationRequestId int fk
  title string
  year int
  seasonNumber int
}

nominationRequests.id < nominations.nominationRequestId

users.id < nominations.userId

nominationRequests.id < seasons.nominationRequestId

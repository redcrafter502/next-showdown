Schema: format for eraser.io

selectionRequests {
  id int pk
  urlId string
  name string
  listName string
  userId string
}

selections {
  id string pk
  selectionRequestsId int fk
  selectedSeasonId string
  name string
}

selectionRequests.id < selections.selectionRequestsId

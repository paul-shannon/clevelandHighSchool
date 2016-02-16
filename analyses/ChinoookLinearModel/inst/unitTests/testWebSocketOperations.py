import sys
import time
from websocket import create_connection
from json import *
ws = create_connection("ws://localhost:4073")
#----------------------------------------------------------------------------------------------------
def testCorrelation():

  print("--- testCorrelation")

  feature1 = "Non.white.minority.population"
  feature2 = "assault.hosp.per.100k"
  payload = {"datasetName": "SouthSeattleHealthImpacts",
             "dataframeName": "tbl.factors",
             "feature1": feature1,
             "feature2": feature2}

  msg = dumps({"cmd": "correlateVectors", "status": "request", "callback":"", "payload": payload})
  ws.send(msg)
  result = loads(ws.recv())
  payload = result["payload"]
  fieldNames = list(payload.keys())
  fieldNames.sort()
  assert(fieldNames == ['correlation', 'entities', 'vec1', 'vec1Max', 'vec1Min', 'vec1Name', 'vec2', 'vec2Max', 'vec2Min', 'vec2Name'])
  assert(payload['vec1Name'] == feature1)
  assert(payload['vec2Name'] == feature2)
  assert(payload['correlation'] == 0.8095)
  assert(payload['vec1'] == [17.5, 28.6, 48.8, 13.8, 71.2, 13, 36.6, 56.2, 70.1, 14.1])
  assert(payload['vec2'] == [20.4, 18.4, 67.4, 24.3, 65.4, 13.2, 82.7, 79.9, 65, 7.4])
  assert(payload['entities'] == ['98102', '98105', '98106', '98107', '98108', '98116', '98122', '98144', '98178', '98199'])
  print("True")

#----------------------------------------------------------------------------------------------------
testCorrelation()



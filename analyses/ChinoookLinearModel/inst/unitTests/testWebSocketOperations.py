import sys
import time
from websocket import create_connection
from json import *
ws = create_connection("ws://localhost:4073")
#----------------------------------------------------------------------------------------------------
def runTests():

   testCorrelation()
   testCorrelationLeaveSomeOut()

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
  assert(fieldNames == ['correlation', 'entities', 'vec1', 'vec1Max', 'vec1Min', 'vec1Name', 'vec2',
                        'vec2Max', 'vec2Min', 'vec2Name', 'yFit'])
  assert(payload['vec1Name'] == feature1)
  assert(payload['vec2Name'] == feature2)

  assert(payload['correlation'] == 0.8095)
  assert(payload['vec1'] == [13, 13.8, 14.1, 17.5, 28.6, 36.6, 48.8, 56.2, 70.1, 71.2])
  assert(payload['vec2'] == [13.2, 24.3, 7.4, 20.4, 18.4, 82.7, 67.4, 79.9, 65, 65.4])
  assert(payload['entities'] == ['98116', '98107', '98199', '98102', '98105', '98122', '98106', '98144', '98178', '98108'])
  assert(payload['yFit'] == [14.5317, 15.3382, 15.6407, 19.0683, 30.2585, 38.3236, 50.6228, 58.0829, 72.0959, 73.2049]);
  print("True")

#----------------------------------------------------------------------------------------------------
def testCorrelationLeaveSomeOut():

  print("--- testCorrelationLeaveSomeOut")

  feature1 = "Non.white.minority.population"
  feature2 = "assault.hosp.per.100k"
  payload = {"datasetName": "SouthSeattleHealthImpacts",
             "dataframeName": "tbl.factors",
             "feature1": feature1,
             "feature2": feature2,
             "leaveOut": ["98108", "98178"]}

  msg = dumps({"cmd": "correlateVectors", "status": "request", "callback":"", "payload": payload})
  ws.send(msg)
  result = loads(ws.recv())
  payload = result["payload"]
  fieldNames = list(payload.keys())
  fieldNames.sort()
  assert(fieldNames == ['correlation', 'entities', 'vec1', 'vec1Max', 'vec1Min', 'vec1Name', 'vec2',
                        'vec2Max', 'vec2Min', 'vec2Name', 'yFit'])
  assert(payload['vec1Name'] == feature1)
  assert(payload['vec2Name'] == feature2)
  assert(payload['correlation'] == 0.8828)
  assert(payload['vec1'] == [13.0, 13.8, 14.1, 17.5, 28.6, 36.6, 48.8, 56.2])
  assert(payload['vec2'] == [13.2, 24.3, 7.4, 20.4, 18.4, 82.7, 67.4, 79.9])
  assert(payload['entities'] == ["98116", "98107", "98199", "98102", "98105", "98122", "98106", "98144"])
  
  assert(min(payload['yFit']) == 7.404)
  assert(max(payload['yFit']) == 107.628)
  
  print("True")

#----------------------------------------------------------------------------------------------------
testCorrelation()
testCorrelationLeaveSomeOut()



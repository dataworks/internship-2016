#!/bin/bash

java -cp `cat .run` -Xmx2048m -Dlog4j.configuration=file:log4j.properties applicant.ml.word2vec.WordMap "$@"

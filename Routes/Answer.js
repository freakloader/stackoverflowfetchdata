const express = require('express');
const router = express.Router();
const axios = require('axios');
const URL = `https://api.stackexchange.com/2.2`;

router.get('/answer', (req,res) => {
    var {questionid:questionID} = req.body;
    // console.log("Question ID:",questionid);
    if(questionID)
    {
        var finalRes = {};
        axios.get(`${URL}/questions/${questionID}`,{
                params:{
                    filter:"withbody",
                    site:"stackoverflow",
                    key:process.env.SECRET_KEY
                }
            })
            .then(response => {
                // console.log("Question response:",response.data)
                finalRes['question_body'] = response.data.items[0].body;
                finalRes['has_accepted_answer_id'] = response.data.items[0].is_answered? true: false;

                //If the question has an accepted answer, then return that answer's body
                if(response.data.items[0].accepted_answer_id)
                {
                    var answerID = response.data.items[0].accepted_answer_id;
                    axios.get(`${URL}/answers/${answerID}`,{
                        params:{
                            filter:"withbody",
                            site:"stackoverflow",
                            key:process.env.SECRET_KEY,
                        }
                    })
                    .then(resp => {
                        finalRes['answer_body'] = resp.data.items[0].body;
                        // console.log(finalRes);
                        res.send(finalRes);
                    })
                    .catch(error => res.send(error));
                }
                else //If the question has not been answered, then return all the answers ordered by maximum votes
                {
                    // var page = 1;
                    // var has_more = true;
                    var answerArr = [];
                    
                    axios.get(`${URL}/questions/${questionID}/answers/`,{
                            params:{
                                order:"desc",
                                sort:"votes",
                                // page:9,
                                pagesize:100,
                                filter:"withbody",
                                site:"stackoverflow",
                                key:process.env.SECRET_KEY,
                            }
                        })
                        .then(resp => {
                            // var answerArr = [];
                            // has_more = resp.data.has_more;
                            resp.data.items.forEach(item =>  answerArr.push(item.body));
                            finalRes['answer_array'] = answerArr;
                            // console.log(answerArr.length);
                            res.send(finalRes);
                        })
                        .catch(error => res.send(error));
                }
            })
            .catch(error => res.send(error));
    }       
    else
    {
        res.sendStatus(400);//.send("No question ID provided");
    }
});

module.exports = router;
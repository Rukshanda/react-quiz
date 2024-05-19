import { useEffect, useReducer } from "react";
import Header from "./Header"
import Main from "./Main";
import Loader from './Loader'
import Error from './Error'
import StartScreen from "./StartScreen";
import Question from './Question';
import NextQuestion from "./NextQuestion";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";
import Timmer from './Timmer'

const initalState = {
  questions: [],

  // 'loading' , 'errorr' , 'ready' , 'active' , 'finished'
  status: 'loading',
  index : 0,
  answer : null,
  points: 0,
  highscore: 0,
  secoundsRemaining : 10,
}

function reducer(state , action){
  switch(action.type){
    case 'dataReceived':
      return{
        ...state,questions: action.payload,
        status: "ready"
      };
     case 'dataFailed':
      return {
        ...state, status : 'error'
      }
      case 'start':
        return {
          ...state, status : 'active',
          secoundsRemaining : state.questions.length * 30,
        }
      case 'newAnswer':
        const question = state.questions.at(state.index)
        return {
          ...state, 
          answer: action.payload,
          points: action.payload === question.correctOption ? 
          state.points + question.points : state.points,
        }
        case 'nextQuestion':
          return {
            ...state,
            index: state.index + 1 ,
            answer: null
          }
        case 'finish': 
        return {
          ...state,
          status : 'finished' , highscore : state.points > state.highscore ? state.points : state.highscore,
        } 
        case 'restart': 
        return {
         ...state ,
         status: 'ready',
         index : 0,
         answer : null,
         points: 0,
         highscore: 0
        }  
        case 'tick' :
          return {
            ...state, secoundsRemaining: state.secoundsRemaining - 1,
            status: state.secoundsRemaining === 0 ? 'finished' : state.status,
          }
      default:
      throw new Error("Action is Unknown")
  }
}

export default function App(){
  //using the reducer hook to manage the state
  const [{questions , status, index , answer , points , highscore , secoundsRemaining }, dispatch] = useReducer(reducer , initalState);

  const numQuestions = questions.length;
  const maxPoints = questions.reduce((prev , cur)=> prev + cur.points, 0);
 useEffect(function(){
  fetch(`http://localhost:8000/questions`)
  .then((res)=>res.json())
  .then((data) => dispatch({type: 'dataReceived' , payload: data}))
  .catch((err) => dispatch({type: 'dataFailed'}))
 },[])

  // JSX-----
  return (
   
   <div className="app">
    <Header />
   <Main>
    {status === "loading" &&  <Loader />}
    {status === "error" &&  <Error />}
    {status === "ready" &&  <StartScreen numQuestions={numQuestions} dispatch={dispatch} />}
    {status === "active" &&( 
    <>
    <Progress numQuestions={numQuestions} index={index} points={points} maxPoints= {maxPoints} answer={answer}/>
     <Question question={questions[index]} dispatch={dispatch} answer={answer}/>
     <footer>
     <Timmer  dispatch={dispatch} secoundsRemaining= {secoundsRemaining}/>
     <NextQuestion dispatch={dispatch} answer={answer} index={index} numQuestions={numQuestions} />
     </footer>
     
    </>
   
    )}
     {status === 'finished' && <FinishScreen points= {points} maxPoints = {maxPoints} dispatch={dispatch} highscore={highscore}/>}
   </Main>
   </div>
   
 
  );
}

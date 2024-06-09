/* eslint-disable react/prop-types */
import SearchPeople from "../components/SearchPeople";
import MeetPeople from "../components/MeetPeople";
import '../styles/FindPeople.css'




const FindPeople = () => {

  return (
      <div className='findPeopleContainer'>
        <h1>Find People!</h1> 
      <SearchPeople
      /> 
      <br />
          <h1>Meet New People:</h1> 
          <MeetPeople
      /> 
      </div>
    );
  };
    
    
export default FindPeople;
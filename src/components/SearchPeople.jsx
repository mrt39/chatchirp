/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import UserCard from "./UserCard";
import '../styles/SearchPeople.css'



const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));



const SearchBar = ({setSearchQuery}) => (
    <div className="textfieldContainer">
            <Search>
              <SearchIconWrapper>
                  <SearchIcon />
              </SearchIconWrapper>
              <TextField
                id="search-bar"
                className="text"
                onInput={(e) => {
                  setSearchQuery(e.target.value);
                }}
                label="Enter a Name..."
                variant="outlined"
                placeholder="Search..."
                size="small"
              />
          </Search>

    </div>


  );

  const filterData = (query, allUsers) => {
    if (!query) {
      return;
    } else {
      return allUsers.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));
    }
  };

/*   const data = [
    "Paris",
    "London",
    "New York",
    "Tokyo",
    "Berlin",
    "Buenos Aires",
    "Cairo",
    "Canberra",
    "Rio de Janeiro",
    "Dublin"
  ]; */

export default function SearchPeople({selectedPerson, setSelectedPerson}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [allUsers, setAllUsers] = useState();
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if(searchQuery===""){
            setFilteredData(null)
        }
        const dataFiltered = filterData(searchQuery, allUsers);
        setFilteredData(dataFiltered)
   
      }, [searchQuery]); 

    
    //fetch for getting data of all people
    useEffect(() => {
      const getMessages = () => {
          fetch('http://localhost:5000/getallusers', {
          method: 'GET',
          })
          .then(response => {
              console.log(response)
              if (response.ok) {
              return response.json(); // Parse JSON when the response is successful
              }
              throw new Error('Network response was not ok.');
          })
          .then(data => {
              setAllUsers(data)
              setLoading(false); // Set loading to false once the data is received
              console.log(data)
          })
          .catch(error => {
              console.error('Error:', error);
              setLoading(false); 
          });
      };
      getMessages();
      }, []); 

  
    return (
      <div className="searchPeopleContainer">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="searchResultDisplayContainer">
        {loading? 
        <Box sx={{ display: 'flex' }}>
          <CircularProgress size="5rem" />
        </Box>
        :
        filteredData? 
          filteredData.map((person) => (
            <div
              className="searchResults"
              key={person.id}
            >
              <UserCard
              person = {person}
              selectedPerson={selectedPerson} 
              setSelectedPerson={setSelectedPerson}
              />
              {person.name}
            </div>
          ))
          :null
        }
        </div>
      </div>
    );
  }
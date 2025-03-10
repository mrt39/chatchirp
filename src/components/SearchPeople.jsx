/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from "react";
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import UserCard from "./UserCard";
import '../styles/SearchPeople.css'
import { fetchAPI } from '../utilities/api';

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

function SearchBar({setSearchQuery}) {
  return (
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
}

function filterData(query, allUsers) {
  if (!query) {
    return;
  } else {
    return allUsers.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));
  }
}

export default function SearchPeople() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState();
  const [loading, setLoading] = useState(true);

  //using useMemo hook for caching the result of the calculation between renders
  //it helps avoid expensive calculations on every render by storing a value until its dependencies change
  //in this case, we're memoizing the user filtering operation to improve performance
  const filteredData = useMemo(() => {
    //this calculation will only run when searchQuery or allUsers changes, not on every render
    //filtering through a large user list is an expensive operation
    //filtering impacts performance especially when typing quickly in the search box
    if (searchQuery === "") {
      return null; //no users shown when search is empty
    } else if (allUsers) {
      //only perform the filtering when user has typed something and users are loaded
      //this prevents the costly array filtering from running on every render cycle
      return filterData(searchQuery, allUsers);
    }
    return null;
  }, [searchQuery, allUsers]); //dependencies that trigger recalculation when they change

  //fetch for getting data of all people
  useEffect(() => {
    async function getAllUsers() {
      try {
        const data = await fetchAPI('/getallusers', {
          method: 'GET'
        });
        setAllUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    }
    
    getAllUsers();
  }, []); 

  return (
    <div className="searchPeopleContainer">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="searchResultDisplayContainer">
        {loading ? 
          <Box sx={{ display: 'flex' }}>
            <CircularProgress size="5rem" />
          </Box>
          :
          filteredData ? 
            filteredData.map((person) => (
              <div
                className="searchResults"
                key={person._id}
              >
                <UserCard person={person} />
              </div>
            ))
            : null
        }
      </div>
    </div>
  );
}
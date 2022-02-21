import React from 'react';
import { connect } from 'react-redux';
import { addRecipe, removeFromCalendar } from "../actions";
import { capitalize } from '../utils/helpers';
import Modal from 'react-modal';
import Loading from 'react-loading';
import { fetchRecipes } from '../utils/api';
import FoodList from './FoodList';
import ShoppingList from './ShoppingList'

class App extends React.Component {
   state = {
      foodModalOpen: false,
      loadingFood: false,
      meal: null,
      day: null,
      food: null,
      ingredientsModalOpen: false
   }
   openFoodModal = (meal, day) => {
      this.setState(() => ({
         foodModalOpen: true,
         meal,
         day
      }))
   }
   openIngredientsModal = () =>{
      this.setState(() =>({
         ingredientsModalOpen: true
      }))
   }
   closeFoodModal = () => {
      this.setState(() => ({
         foodModalOpen: false,
         meal: null,
         day: null
      }))
   }
   closeIngredientsModal = () =>{
      this.setState(() =>({
         ingredientsModalOpen: false
      
      }))

   }
   generateShoppingList = () => {
      return this.props.calendar.reduce((result, { meals }) => {
        const { breakfast, lunch, dinner } = meals
  
        breakfast && result.push(breakfast);
        lunch && result.push(lunch);
        dinner && result.push(dinner);
  
        return result;
      }, [])
      .reduce((ings, { ingredientLines }) => ings.concat(ingredientLines), []);
    }
   searchFood = (e) => {
      if (!this.input.value) {
         return;
      }
      e.preventDefault()
      this.setState(() => ({ loadingFood: true }))
      fetchRecipes(this.input.value)
         .then((food) => this.setState(() => ({
            food,
            loadingFood: false,
         })))
   }
   render() {

      const { calendar, remove, addRecipe } = this.props;
      const mealOrder = ["breakfast", "lunch", "dinner"];
      return (
         <div className="container">
            <div className='nav'>
               <h1 className='header'>Meals</h1>
               <button
                  className='shopping-list'
                  onClick={this.openIngredientsModal}>
                  Shopping List
               </button>
            </div>

            <ul className='meal-types'>
               {mealOrder.map((mealType) => (
                  <li key={mealType} className='subheader'>
                     {capitalize(mealType)}
                  </li>
               ))}
            </ul>
            <div className='calendar'>
               <div className='days'>
                  {calendar.map(({ day }) => <h3 key={day} className='subheader'>{capitalize(day)}</h3>)}
               </div>
               <div className='icon-grid'>
                  {calendar.map(({ day, meals }) => (
                     <ul key={day}>
                        {mealOrder.map(meal => (
                           <li key={meal} className="meal">
                              {meals[meal]
                                 ? <div className='food-item'>
                                    <img src={meals[meal].image} alt={meals[meal].label} />
                                    <button onClick={() => remove({ meal, day })}>Clear</button>
                                 </div>
                                 : <button onClick={() => this.openFoodModal(meal, day)} className='icon-btn'>
                                    Add
                                 </button>}
                           </li>
                        ))}
                     </ul>
                  ))}
               </div>
            </div>
            <Modal
               className='modal'
               overlayClassName='overlay'
               isOpen={this.state.foodModalOpen === true}
               onRequestClose={this.closeFoodModal}
               contentLabel='Modal'
            >
               <div>
                  {this.state.loadingFood
                     ?
                     <div>
                        <Loading delay={200} type='spin' color='#222' className='loading' />
                     </div>
                     : <div className='search-container'>
                        <h3 className='subheader'>
                           Find a meal for {this.state.day} {this.state.meal}.
                        </h3>
                        <div className='search'>
                           <input
                              className='food-input'
                              type='text'
                              placeholder='Search Foods'
                              ref={(input) => this.input = input}
                           />
                           <button
                              className='icon-btn'
                              onClick={this.searchFood}>
                              Search
                           </button>
                           {this.state.food !== null && (
                              <FoodList
                                 food={this.state.food}
                                 onSelect={(recipe) => {
                                    addRecipe({ recipe, day: this.state.day, meal: this.state.meal });
                                    this.closeFoodModal();
                                 }}
                              />
                           )}
                        </div>
                     </div>}
               </div>
            </Modal>
            <Modal
                  className= 'modal'
                  overlayClassName = 'overlay'
                  isOpen ={this.state.ingredientsModalOpen ===true}
                  onRequestClose = {this.closeIngredientsModal}
                  contentLabel = 'modal'                               
            >
               {this.state.ingredientsModalOpen === true && <ShoppingList list={this.generateShoppingList()}/>}
            </Modal>
         </div>
      );
   }
}

function mapStateToProps({ calendar, food }) {
   const dayOrder = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
   return {
      calendar: dayOrder.map((day) => ({
         day,
         meals: Object.keys(calendar[day]).reduce((meals, meal) => {
            if (calendar[day][meal] !== null) {
               meals[meal] = food[calendar[day][meal]];
            }
            else {
               meals[meal] = null;
            }
            return meals;
         }, {})
      }))
   }
}
function mapDispatchToProps(dispatch) {
   return {
      addRecipe: (data) => dispatch(addRecipe(data)),
      remove: (data) => dispatch(removeFromCalendar(data)),
   }
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-quiz',
  templateUrl: './add-quiz.component.html',
  styleUrls: ['./add-quiz.component.css']
})
export class AddQuizComponent {

  quiz = {
    title: '',
    description: '',
    maxMarks: '',
    numberOfQuestions: '',
    active : true,
    category: {
      catId: ''
    }
  }

  categories = [{
    catId: 23,
    title: 'Programming'
  }]

  constructor(private _category:CategoryService, private _snack:MatSnackBar, private _quiz:QuizService, private router: Router) {}

  ngOnInit(): void {
    this._category.categories().subscribe(
      (data:any)=> {
        // load categories 
        this.categories = data;
        // console.log(this.categories);
      },
      (error) => {
        Swal.fire('Error !!', 'Error while loading data from server', 'error');
      }
    )
  }

  formSubmit() {
    if(this.quiz.title.trim()=='' || this.quiz.title == null) {
      this._snack.open("Title Required !!", '', {
        duration: 3000
      })
    }

    this._quiz.addQuiz(this.quiz).subscribe(
      (data:any) => {
        this.router.navigate(['/admin/quizzes'])
        Swal.fire('Success !!', 'Category added successfully', 'success');
      },
      (error) => {
        Swal.fire('Error !!', 'Something went wrong', 'error');
      }
    )
  }
}

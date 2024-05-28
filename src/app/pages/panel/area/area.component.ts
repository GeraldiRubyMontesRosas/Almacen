import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { LoadingStates } from 'src/app/global/global';
import { Area } from 'src/app/models/Area';

@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.css'],
})
export class AreaComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  area!: Area;
  areaForm!: FormGroup;
  areas: Area[] = [];
  areasFilter: Area[] = [];
  isLoading = LoadingStates.neutro;
  isModalAdd: boolean = true;
  formData: any;
  id!: number;
  idUpdate!: number;
  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder
  ) {
    this.creteForm();
  }

  creteForm() {
    this.areaForm = this.formBuilder.group({
      id: [null],
      nombre: [
        '',
        [
          Validators.required,
          Validators.maxLength(40),
          Validators.minLength(2),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
    });
  }
  handleChangeAdd() {
    if (this.areaForm) {
      this.areaForm.reset();
      this.isModalAdd = true;
    }
  }
  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }
  setDataModalUpdate(dto: Area) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.areaForm.patchValue({
      id: dto.id,
      nombre: dto.nombre,
    });
  }
  deleteItem(id: number, nameItem: string) {}
}

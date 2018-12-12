import {Component, Inject} from '@angular/core';
import {VerificationService} from './services/verification.service';
import {BehaviorSubject} from 'rxjs';
import {ValidationReport} from './model/reporting/validation-report.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  /** */
  private _reports: BehaviorSubject<ValidationReport> = new BehaviorSubject(null);

  /**
   *
   * @param private
   */
  constructor(@Inject(VerificationService) private _service) {}

  /**
   *
   */
  get reports() {
    return this._reports;
  }

  /**
   *
   */
  public handleUpload(files: FileList) {
    if (files.length > 0) {
      const file = files.item(0);
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent) => this.runValidation(file.name, <string>(<FileReader>event.target).result);
      reader.readAsText(file);
    }
  }

  /**
   *
   * @param text
   */
  private runValidation(filename: string, json: string) {
    this._reports.next(this._service.validate(filename, json));
  }
}

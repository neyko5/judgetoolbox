import { Component, OnDestroy, OnInit } from '@angular/core';
import { SituationService } from './situation.service';
import { Player } from './player';
import { Scenario } from './scenario';
import { Tournament } from './tournament';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { MdDialog } from '@angular/material';

@Component({
  selector: 'situation-generator-config',
  templateUrl: './situation-generator-config.component.html',
  styleUrls: ['./situation-generator-config.component.scss']
})
export class SituationGeneratorConfigComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  private player: Player = new Player();
  private scenarios: Scenario[] = [];
  private tournaments: Tournament[] = [];

  private players:{
    type: Number,
    personality: Number,
    guilty: Number,
    opinion: Number
  }[] = [
    {type: null, personality: null, guilty: null, opinion: null},
    {type: null, personality: null, guilty: null, opinion: null}
    ];
  private scenario: Scenario = null;
  private tournament: Tournament = null;

  constructor(
    private situationService: SituationService,
    private router: Router,
    private translate: TranslateService,
    private dialog: MdDialog
  ) {}

  ngOnInit() {
    this.getData();
    this.translate.onLangChange.takeUntil(this.ngUnsubscribe).subscribe(() => {
      this.getData();
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSubmit() {
    let scenario: number = Math.round(Math.random() * this.scenarios.length) - 1;
    if (this.scenario) { // scenarios are selected by a common topic, so pick one at random
      const subScenarios: Scenario[] = this.scenarios.filter(elem => elem.topic == this.scenario.topic);
      scenario = this.scenarios.indexOf(subScenarios[Math.round(Math.random() * (subScenarios.length - 1))]);
    }

    let players = [];
    this.players.forEach(player => {
      if(player.type === null) player.type = Math.round(Math.random() * (this.player.getTypes().length - 1));
      if(player.personality === null) player.personality = Math.round(Math.random() * (this.player.getPersonalities().length - 1));
      if(player.guilty === null) player.guilty = Math.round(Math.random() * (this.player.getGuilts().length - 1));
      if(player.opinion === null) player.opinion = Math.round(Math.random() * (this.player.getOpinions().length - 1));
      players.push([player.type, player.personality, player.guilty, player.opinion].join('-'));
    });

    const tournament: number = this.tournament ? this.tournaments.indexOf(this.tournament) : Math.round(Math.random() * (this.tournaments.length - 1));

    this.router.navigate(['/random-situation', {scenario, players: players.join('--'), tournament}]);
  }

  showFaq() {
    this.dialog.open(SituationGeneratorConfigDialog);
  }

  private getData():void {
    this.situationService.getPlayer()
      .subscribe(player => this.player = player);

    this.situationService.getScenarios()
      .subscribe(scenarios => this.scenarios = scenarios);

    this.situationService.getTournaments()
      .subscribe(tournaments => this.tournaments = tournaments);
  }
}

@Component({
  selector: 'situation-generator-config-dialog',
  templateUrl: './situation-generator-config-dialog.html',
})
export class SituationGeneratorConfigDialog {}
